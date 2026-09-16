import React from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { TripRecord, CompanySettings } from '../types';
import { OfficialInvoiceDocument } from '../components/OfficialInvoiceDocument';

export interface GeneratePdfResult {
  pdf: jsPDF;
  filename: string;
  blob: Blob;
}

export interface GenerateImageResult {
  dataUrl: string;
  filename: string;
}

/**
 * Inlines all <img> elements in the container as Base64 Data URLs.
 * This guarantees html2canvas paints images synchronously with 0 network latency,
 * no CORS restrictions, and zero missing image boxes in the resulting PDF.
 */
async function prepareContainerImagesForCapture(container: HTMLElement): Promise<void> {
  // 1. Initial wait for React commit and DOM mount
  await new Promise((resolve) => setTimeout(resolve, 200));

  // 2. Wait for document fonts
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font wait errors
    }
  }

  // 3. Convert all images in the container to base64 Data URLs
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      // If already data URL, ensure it is fully loaded
      if (img.src && img.src.startsWith('data:')) {
        if (!img.complete) {
          await new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
          });
        }
        return;
      }

      // Convert image to base64
      if (img.src) {
        try {
          const response = await fetch(img.src);
          if (response.ok) {
            const blob = await response.blob();
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            img.src = dataUrl;
            if (img.decode) {
              try {
                await img.decode();
              } catch {
                // Ignore decode warning
              }
            }
            return;
          }
        } catch (err) {
          console.warn('Could not inline image for PDF, attempting standard load:', img.src, err);
        }
      }

      // Fallback: wait for regular load
      if (!img.complete || img.naturalWidth === 0) {
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }
    })
  );

  // Short buffer for style and layout stabilization
  await new Promise((resolve) => setTimeout(resolve, 150));
}

/**
 * Renders the official invoice into an isolated off-screen DOM element
 * with fixed 794px width (standard A4 at 96 DPI), captures it at 2x crisp resolution,
 * and cleans up afterwards.
 */
async function captureInvoiceCanvas(
  trip: TripRecord,
  companySettings: CompanySettings
): Promise<HTMLCanvasElement> {
  // 1. Create off-screen container with fixed desktop A4 dimensions
  // Position at top: 0, left: 0 behind current view (zIndex: -9999) so browsers decode images
  const container = document.createElement('div');
  container.id = 'offscreen-invoice-capture-root';
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.minWidth = '794px';
  container.style.maxWidth = '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.style.boxSizing = 'border-box';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';

  document.body.appendChild(container);

  // 2. Mount React OfficialInvoiceDocument
  const root = createRoot(container);
  root.render(
    <OfficialInvoiceDocument trip={trip} companySettings={companySettings} />
  );

  try {
    // 3. Ensure all images are loaded, inlined as Base64, and decoded
    await prepareContainerImagesForCapture(container);

    // 4. Capture with html2canvas-pro
    // windowWidth: 1200 forces desktop media queries so nothing stacks into mobile layout
    const canvas = await html2canvas(container, {
      scale: 2, // 2x gives 1588px width - razor sharp on A4 print with fast processing
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 1200,
    });

    return canvas;
  } finally {
    // 5. Cleanup DOM cleanly
    try {
      root.unmount();
    } catch {
      // Ignore unmount error if already unmounted
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Generates an official, un-stretched A4 Tax Invoice PDF document.
 * Works identically on mobile and desktop browsers.
 */
export async function generateInvoicePdf(
  trip: TripRecord,
  companySettings: CompanySettings
): Promise<GeneratePdfResult> {
  const canvas = await captureInvoiceCanvas(trip, companySettings);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm

  const margin = 8; // 8 mm margin on sides
  const printableWidth = pageWidth - margin * 2; // 194 mm
  const printableHeight = pageHeight - margin * 2; // 281 mm

  // Check if content fits comfortably on 1 page (allow up to 12% flex)
  const fullRenderHeight = (canvas.height * printableWidth) / canvas.width;

  if (fullRenderHeight <= printableHeight * 1.12) {
    // SINGLE PAGE FIT:
    // Scale strictly proportionally so aspect ratio is 100% preserved
    const scale = Math.min(printableWidth / canvas.width, printableHeight / canvas.height);
    const finalWidth = canvas.width * scale;
    const finalHeight = canvas.height * scale;

    // Center horizontally within printable area
    const x = margin + (printableWidth - finalWidth) / 2;
    const y = margin;

    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');
  } else {
    // MULTI-PAGE SLICING:
    // When an invoice has many items, cleanly slice into multiple pages
    // without ever squashing or stretching!
    const pageCanvasHeight = Math.floor(canvas.width * (printableHeight / printableWidth));
    let sourceY = 0;
    let pageIndex = 0;

    while (sourceY < canvas.height) {
      if (pageIndex > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        const sliceData = sliceCanvas.toDataURL('image/png', 1.0);
        const renderedHeight = (sliceHeight * printableWidth) / canvas.width;
        pdf.addImage(sliceData, 'PNG', margin, margin, printableWidth, renderedHeight, undefined, 'FAST');
      }

      sourceY += pageCanvasHeight;
      pageIndex++;
    }
  }

  const cleanCustomerName = (trip.customerName || 'Guest').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Invoice_${trip.billNo}_${cleanCustomerName}.pdf`;
  const blob = pdf.output('blob');

  return { pdf, filename, blob };
}

/**
 * Generates an un-stretched high-resolution PNG image of the invoice.
 */
export async function generateInvoiceImage(
  trip: TripRecord,
  companySettings: CompanySettings
): Promise<GenerateImageResult> {
  const canvas = await captureInvoiceCanvas(trip, companySettings);
  const cleanCustomerName = (trip.customerName || 'Guest').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Invoice_${trip.billNo}_${cleanCustomerName}.png`;
  const dataUrl = canvas.toDataURL('image/png', 1.0);

  return { dataUrl, filename };
}

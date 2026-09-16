import React, { useState, useRef } from 'react';
import { TripRecord, CompanySettings } from '../types';
import { 
  downloadTripsCsv, 
  downloadCompleteJsonBackup, 
  copyTripsToClipboard, 
  parseBackupFile 
} from '../utils/dataBackup';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Upload, 
  Database, 
  FileSpreadsheet, 
  FileCode, 
  CheckCircle2, 
  AlertCircle,
  HardDrive,
  Info
} from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TripRecord[];
  archivedTrips: TripRecord[];
  companySettings: CompanySettings;
  onRestoreData?: (activeTrips: TripRecord[], archivedTrips: TripRecord[], settings?: CompanySettings) => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  trips,
  archivedTrips,
  companySettings,
  onRestoreData,
}) => {
  const [copiedClipboard, setCopiedClipboard] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const totalRecords = trips.length + archivedTrips.length;

  const handleDownloadCsv = (type: 'active' | 'archive' | 'all') => {
    const data = 
      type === 'active' ? trips :
      type === 'archive' ? archivedTrips :
      [...trips, ...archivedTrips];

    downloadTripsCsv(data, type, companySettings.companyName || 'TravelCare');
    setStatusMessage(`Downloaded ${data.length} records as CSV spreadsheet!`);
    setRestoreStatus('success');
  };

  const handleDownloadJson = () => {
    downloadCompleteJsonBackup(trips, archivedTrips, companySettings);
    setStatusMessage(`Complete backup file downloaded (${totalRecords} invoices + settings)!`);
    setRestoreStatus('success');
  };

  const handleCopyClipboard = async () => {
    const all = [...trips, ...archivedTrips];
    const ok = await copyTripsToClipboard(all);
    if (ok) {
      setCopiedClipboard(true);
      setStatusMessage('Copied all trip rows to clipboard! You can paste directly into Excel or Google Sheets (Ctrl+V / Cmd+V).');
      setRestoreStatus('success');
      setTimeout(() => setCopiedClipboard(false), 3000);
    } else {
      setStatusMessage('Could not copy to clipboard.');
      setRestoreStatus('error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = parseBackupFile(content);
      if (result.success && result.data) {
        if (onRestoreData) {
          const { activeTrips, archivedTrips, companySettings: restoredSettings } = result.data;
          onRestoreData(activeTrips, archivedTrips, restoredSettings);
          setStatusMessage(`Successfully restored ${activeTrips.length} active and ${archivedTrips.length} archived invoices!`);
          setRestoreStatus('success');
        }
      } else {
        setStatusMessage(result.error || 'Failed to parse backup file.');
        setRestoreStatus('error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Data Export & Backup Center</h2>
              <p className="text-xs text-slate-300">Download Excel/CSV spreadsheets or save full offline backups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Storage Information Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HardDrive className="w-5 h-5 text-slate-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Offline Local Storage Active</span>
                <span className="text-[11px] text-slate-500">
                  {trips.length} Active Invoices • {archivedTrips.length} Archived Invoices • {totalRecords} Total Records
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
              Saved Securely
            </span>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-start space-x-2 ${
              restoreStatus === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
              restoreStatus === 'error' ? 'bg-rose-50 text-rose-900 border border-rose-200' :
              'bg-blue-50 text-blue-900 border border-blue-200'
            }`}>
              {restoreStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Section 1: Excel / CSV Spreadsheets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Excel & CSV Spreadsheets
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Opens in Excel / Google Sheets</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Active CSV */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Active Trips</span>
                  <span className="text-[11px] font-mono font-bold text-blue-600">{trips.length}</span>
                </div>
                <button
                  onClick={() => handleDownloadCsv('active')}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>

              {/* Archived CSV */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Archived Trips</span>
                  <span className="text-[11px] font-mono font-bold text-amber-600">{archivedTrips.length}</span>
                </div>
                <button
                  onClick={() => handleDownloadCsv('archive')}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>

              {/* All Invoices CSV */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Complete Ledger</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-600">{totalRecords}</span>
                </div>
                <button
                  onClick={() => handleDownloadCsv('all')}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download All</span>
                </button>
              </div>
            </div>

            {/* Quick Copy to Clipboard */}
            <button
              onClick={handleCopyClipboard}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              {copiedClipboard ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied to Clipboard! Ready to paste (Ctrl+V)</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copy All Records for Direct Pasting into Excel / Sheets</span>
                </>
              )}
            </button>
          </div>

          {/* Section 2: Complete System JSON Backup & Restore */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Full Snapshot Backup & Restore
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Includes invoices & branding settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Download JSON Backup */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-blue-950 block">Export Full JSON Backup</span>
                <p className="text-[11px] text-blue-800">
                  Save a single backup file with all trips, archived records, company logo, and invoice settings.
                </p>
                <button
                  onClick={handleDownloadJson}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (.json)</span>
                </button>
              </div>

              {/* Restore JSON Backup */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Restore from Backup</span>
                <p className="text-[11px] text-slate-600">
                  Upload a previously saved backup file to restore all your invoices and settings.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Restore Backup</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Safe & Private */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">100% Private & Standalone</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Your data stays strictly on your device without requiring third-party cloud accounts or billing setups. Download regular CSV/JSON backups to keep historical records safe.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

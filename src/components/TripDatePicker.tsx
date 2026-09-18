import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Moon,
  Sun,
  X,
  Check,
  ArrowRight,
} from 'lucide-react';

interface TripDatePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (start: string, end: string, nights: number) => void;
  className?: string;
}

// Utility: parse 'YYYY-MM-DD' cleanly into a local Date object without UTC drift
export const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Utility: format local Date into 'YYYY-MM-DD'
export const toISODateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Format for readable presentation (e.g. "Sun, 20 Sep 2026")
export const formatReadableDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

// Calculate exact nights between two dates
export const calculateNightsBetween = (start: Date, end: Date): number => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const diff = Math.round((utcEnd - utcStart) / msPerDay);
  return Math.max(1, diff);
};

// Add days helper
export const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + days);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Common duration presets for Kerala holidays
const DURATION_PRESETS = [
  { label: '3D / 2N', nights: 2, subtitle: 'Weekend' },
  { label: '4D / 3N', nights: 3, subtitle: 'Hills & Water' },
  { label: '6D / 5N', nights: 5, subtitle: 'Classic Kerala', popular: true },
  { label: '8D / 7N', nights: 7, subtitle: 'Grand Tour' },
  { label: '10D / 9N', nights: 9, subtitle: 'Complete South' },
];

export const TripDatePicker: React.FC<TripDatePickerProps> = ({
  startDate,
  endDate,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activePicker, setActivePicker] = useState<'start' | 'end'>('start');
  
  const parsedStart = parseLocalDate(startDate);
  const parsedEnd = parseLocalDate(endDate);
  
  // Internal calendar viewing month & year
  const [viewYear, setViewYear] = useState<number>(parsedStart.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(parsedStart.getMonth());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Today reference without time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync viewing month when opening
  const handleOpenPicker = (type: 'start' | 'end') => {
    setActivePicker(type);
    if (type === 'start') {
      setViewYear(parsedStart.getFullYear());
      setViewMonth(parsedStart.getMonth());
    } else {
      setViewYear(parsedEnd.getFullYear());
      setViewMonth(parsedEnd.getMonth());
    }
    setIsOpen(true);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Check if prev month is in the past
  const isPrevMonthDisabled = () => {
    const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const targetMonthDate = new Date(viewYear, viewMonth, 1);
    return targetMonthDate <= currentMonthDate;
  };

  // Handle clicking a day in the calendar grid
  const handleSelectDay = (dayDate: Date) => {
    if (activePicker === 'start') {
      const newStart = dayDate;
      let newEnd = parsedEnd;

      // Ensure Drop-off date is always logically strictly AFTER the Pick-up date
      if (newStart >= parsedEnd) {
        // Automatically maintain previous night count or set minimum 1 night
        const currentNights = calculateNightsBetween(parsedStart, parsedEnd);
        const nightsToAdd = Math.max(1, currentNights);
        newEnd = addDays(newStart, nightsToAdd);
      }

      const nights = calculateNightsBetween(newStart, newEnd);
      onChange(toISODateString(newStart), toISODateString(newEnd), nights);
      
      // Seamlessly switch to selecting Drop-off date
      setActivePicker('end');
      if (newEnd.getMonth() !== viewMonth || newEnd.getFullYear() !== viewYear) {
        setViewMonth(newStart.getMonth());
        setViewYear(newStart.getFullYear());
      }
    } else {
      // Selecting Drop-off date
      // Drop-off date MUST be logically after Pick-up date
      if (dayDate <= parsedStart) {
        return; // Disallowed
      }

      const newEnd = dayDate;
      const nights = calculateNightsBetween(parsedStart, newEnd);
      onChange(toISODateString(parsedStart), toISODateString(newEnd), nights);
      // Completed selection
      setIsOpen(false);
    }
  };

  // Handle preset duration button
  const handleApplyPreset = (presetNights: number) => {
    const newEnd = addDays(parsedStart, presetNights);
    onChange(toISODateString(parsedStart), toISODateString(newEnd), presetNights);
  };

  // Generate days array for current month view
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const currentNights = calculateNightsBetween(parsedStart, parsedEnd);
  const currentDays = currentNights + 1;

  // Relative label for Pick-up
  const getRelativeStartLabel = () => {
    const diff = Math.round((parsedStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff > 1 && diff <= 7) return `In ${diff} days`;
    return null;
  };

  const relativeLabel = getRelativeStartLabel();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Pick-up and Drop-off Interactive Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-brand-green" />
            <span>Select Travel Dates (Pick-up &amp; Drop-off)</span>
          </label>
          <span className="text-[11px] font-semibold text-brand-green bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1">
            <Moon className="w-3 h-3 text-brand-green" />
            <span>{currentNights} {currentNights === 1 ? 'Night' : 'Nights'} / {currentDays} Days</span>
          </span>
        </div>

        {/* Dual Trigger Card Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
          {/* Pick-up Date Card */}
          <button
            type="button"
            onClick={() => handleOpenPicker('start')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer relative group flex items-center justify-between ${
              isOpen && activePicker === 'start'
                ? 'border-brand-green bg-emerald-50/50 ring-2 ring-brand-green/20 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
            }`}
            aria-label="Select Pick-up Date"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Pick-up Date
                </span>
                {relativeLabel && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                    {relativeLabel}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {formatReadableDate(parsedStart)}
              </p>
              <p className="text-[11px] text-slate-500">Trip begins / Airport or Station</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100/60 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center shrink-0 ml-2 transition-colors">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </button>

          {/* Drop-off Date Card */}
          <button
            type="button"
            onClick={() => handleOpenPicker('end')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer relative group flex items-center justify-between ${
              isOpen && activePicker === 'end'
                ? 'border-brand-green bg-emerald-50/50 ring-2 ring-brand-green/20 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
            }`}
            aria-label="Select Drop-off Date"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                  Drop-off Date
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200/60">
                  +{currentNights}N
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {formatReadableDate(parsedEnd)}
              </p>
              <p className="text-[11px] text-slate-500">Trip finishes / Return journey</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-100/60 text-slate-600 group-hover:text-blue-700 flex items-center justify-center shrink-0 ml-2 transition-colors">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Quick Kerala Tour Duration Presets */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Quick Presets:
          </span>
          {DURATION_PRESETS.map((preset) => {
            const isMatch = currentNights === preset.nights;
            return (
              <button
                key={preset.nights}
                type="button"
                onClick={() => handleApplyPreset(preset.nights)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  isMatch
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                }`}
                title={`${preset.subtitle} (${preset.nights} Nights)`}
              >
                <span>{preset.label}</span>
                {preset.popular && (
                  <span className="text-[9px] px-1 py-0 rounded bg-brand-green text-white font-extrabold uppercase">
                    ★
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Robust Interactive Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-[380px] mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 sm:p-5 animate-fadeIn">
          {/* Header Bar with Tabs & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            {/* Step Selection Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActivePicker('start');
                  setViewMonth(parsedStart.getMonth());
                  setViewYear(parsedStart.getFullYear());
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activePicker === 'start'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Pick-up
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePicker('end');
                  setViewMonth(parsedEnd.getMonth());
                  setViewYear(parsedEnd.getFullYear());
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activePicker === 'end'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Drop-off
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close date picker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Prompt instruction banner */}
          <div className="mb-3 text-xs font-medium py-1.5 px-3 rounded-lg flex items-center justify-between bg-slate-50 border border-slate-200/80">
            <span className="text-slate-700">
              {activePicker === 'start' ? (
                <span className="font-semibold text-emerald-800">Select trip Pick-up date:</span>
              ) : (
                <span className="font-semibold text-blue-800">Select trip Drop-off date:</span>
              )}
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              {activePicker === 'end' ? 'Must be after Pick-up' : 'Min: Today'}
            </span>
          </div>

          {/* Month / Year Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isPrevMonthDisabled()}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-bold text-slate-900 font-display">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_NAMES.map((name) => (
              <span key={name} className="text-[11px] font-bold text-slate-400 py-1">
                {name}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty offset padding for days before month start */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 w-full" />
            ))}

            {/* Actual Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const currentDayDate = new Date(viewYear, viewMonth, dayNumber, 0, 0, 0, 0);
              const currentMs = currentDayDate.getTime();
              const startMs = parsedStart.getTime();
              const endMs = parsedEnd.getTime();

              const isPast = currentDayDate < today;
              const isStart = currentMs === startMs;
              const isEnd = currentMs === endMs;
              
              // In active selection mode for Drop-off, any date on or before start date is disabled
              const isDropOffDisallowed = activePicker === 'end' && currentMs <= startMs;
              const isDisabled = isPast || isDropOffDisallowed;

              // Check if date is in current selected range
              const isInRange = currentMs > startMs && currentMs < endMs;

              // Check if in hover preview range when picking dropoff
              const isHoveredRange =
                activePicker === 'end' &&
                hoverDate &&
                hoverDate > parsedStart &&
                currentMs > startMs &&
                currentMs <= hoverDate.getTime();

              return (
                <button
                  key={dayNumber}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(currentDayDate)}
                  onMouseEnter={() => setHoverDate(currentDayDate)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`h-9 w-full rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative select-none ${
                    isDisabled
                      ? 'text-slate-300 bg-transparent cursor-not-allowed'
                      : isStart
                      ? 'bg-brand-green text-white font-bold shadow-sm shadow-brand-green/30 scale-105 z-10'
                      : isEnd
                      ? 'bg-brand-navy text-white font-bold shadow-sm shadow-brand-navy/30 scale-105 z-10'
                      : isInRange
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : isHoveredRange
                      ? 'bg-emerald-100/70 text-emerald-900'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-brand-green'
                  }`}
                  title={
                    isStart
                      ? 'Pick-up Date'
                      : isEnd
                      ? 'Drop-off Date'
                      : isDropOffDisallowed
                      ? 'Drop-off date must be after Pick-up'
                      : `${dayNumber} ${MONTH_NAMES[viewMonth]} ${viewYear}`
                  }
                >
                  <span>{dayNumber}</span>
                  {/* Visual Indicator dots for Start & End */}
                  {isStart && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white"></span>
                  )}
                  {isEnd && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer with summary & Confirm */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="font-bold text-slate-900">{formatShortDate(parsedStart)}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="font-bold text-slate-900">{formatShortDate(parsedEnd)}</span>
              <span className="text-[11px] font-bold text-brand-green ml-1">
                ({currentNights}N / {currentDays}D)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-xl bg-brand-navy hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Confirm Dates
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

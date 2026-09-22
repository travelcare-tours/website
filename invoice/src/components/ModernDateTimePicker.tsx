import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface ModernDatePickerProps {
  id?: string;
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  id,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date',
  className = '',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value or fallback
  const parsedValueDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return null;
  }, [value]);

  // Track the month and year currently displayed in the calendar
  const [viewDate, setViewDate] = useState<Date>(() => {
    return parsedValueDate || new Date();
  });

  // When value prop updates externally and user isn't actively navigating, sync viewDate
  useEffect(() => {
    if (parsedValueDate) {
      setViewDate(parsedValueDate);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Format display label: "Tue, 22 Sep 2026"
  const formattedDisplay = useMemo(() => {
    if (!parsedValueDate) return '';
    try {
      const dayName = parsedValueDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = String(parsedValueDate.getDate()).padStart(2, '0');
      const monthShort = parsedValueDate.toLocaleDateString('en-US', { month: 'short' });
      const year = parsedValueDate.getFullYear();
      return `${dayName}, ${dayNum} ${monthShort} ${year}`;
    } catch {
      return value;
    }
  }, [parsedValueDate, value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Calendar cells generation
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    // Adjust to Monday = 0
    const startOffset = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { dateStr: string; dayNumber: number; isCurrentMonth: boolean; isDisabled: boolean }[] = [];

    // Empty offset days
    for (let i = 0; i < startOffset; i++) {
      cells.push({ dateStr: '', dayNumber: 0, isCurrentMonth: false, isDisabled: true });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      let isDisabled = false;
      if (minDate && dateStr < minDate) isDisabled = true;
      if (maxDate && dateStr > maxDate) isDisabled = true;

      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isDisabled
      });
    }

    return cells;
  }, [year, month, minDate, maxDate]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full pl-8 pr-2.5 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium text-slate-800 text-left flex items-center justify-between hover:border-slate-400 transition-colors shadow-xs"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-2.5 pointer-events-none" />
        <span className={formattedDisplay ? 'text-slate-800' : 'text-slate-400'}>
          {formattedDisplay || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>

      {/* Hidden input for HTML form validation */}
      {required && (
        <input
          type="text"
          className="sr-only"
          value={value}
          required={required}
          onChange={() => {}}
          tabIndex={-1}
        />
      )}

      {/* React Date Picker Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-[280px] sm:w-[290px] animate-in fade-in zoom-in-95 duration-100">
          {/* Header with Month Navigation */}
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {WEEK_DAYS.map((wd) => (
              <span key={wd} className="text-[10px] font-semibold text-slate-400">
                {wd}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return <div key={`empty-${idx}`} className="w-8 h-8" />;
              }

              const isSelected = cell.dateStr === value;
              const isToday = cell.dateStr === todayStr;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={cell.isDisabled}
                  onClick={() => handleSelectDate(cell.dateStr)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    cell.isDisabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : isToday
                      ? 'border border-blue-500 text-blue-600 font-bold hover:bg-blue-50'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cell.dayNumber}
                </button>
              );
            })}
          </div>

          {/* Bottom Shortcuts */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => handleSelectDate(todayStr)}
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tmr = new Date();
                tmr.setDate(tmr.getDate() + 1);
                handleSelectDate(tmr.toISOString().split('T')[0]);
              }}
              className="text-slate-500 font-medium hover:text-slate-800 transition-colors"
            >
              Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ModernTimePickerProps {
  id?: string;
  value: string; // HH:mm (24-hr format, e.g. "08:00" or "20:00")
  onChange: (timeStr: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const COMMON_TIMES = [
  { value: '06:00', label: '06:00 AM', desc: 'Early Morning' },
  { value: '08:00', label: '08:00 AM', desc: 'Standard Pickup' },
  { value: '09:00', label: '09:00 AM', desc: 'Morning' },
  { value: '10:00', label: '10:00 AM', desc: 'Midday' },
  { value: '13:00', label: '01:00 PM', desc: 'Afternoon' },
  { value: '16:00', label: '04:00 PM', desc: 'Tea time' },
  { value: '18:00', label: '06:00 PM', desc: 'Evening Drop' },
  { value: '20:00', label: '08:00 PM', desc: 'Night Drop' },
  { value: '22:00', label: '10:00 PM', desc: 'Late Night' },
];

export const ModernTimePicker: React.FC<ModernTimePickerProps> = ({
  id,
  value,
  onChange,
  placeholder = 'Time',
  className = '',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse 24-hr time into 12-hr parts
  const parsedTime = useMemo(() => {
    if (!value) return { hour12: 8, minute: 0, isPM: false };
    const parts = value.split(':').map(Number);
    const h24 = !isNaN(parts[0]) ? parts[0] : 8;
    const m = !isNaN(parts[1]) ? parts[1] : 0;
    const isPM = h24 >= 12;
    let hour12 = h24 % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour12, minute: m, isPM };
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Display format: "08:00 AM"
  const formattedDisplay = useMemo(() => {
    if (!value) return '';
    const hStr = String(parsedTime.hour12).padStart(2, '0');
    const mStr = String(parsedTime.minute).padStart(2, '0');
    const ampm = parsedTime.isPM ? 'PM' : 'AM';
    return `${hStr}:${mStr} ${ampm}`;
  }, [value, parsedTime]);

  const updateTime = (hour12: number, minute: number, isPM: boolean) => {
    let h24 = hour12 % 12;
    if (isPM) h24 += 12;
    const hStr = String(h24).padStart(2, '0');
    const mStr = String(minute).padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full pl-7 pr-2 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium font-mono text-slate-800 text-left flex items-center justify-between hover:border-slate-400 transition-colors shadow-xs"
      >
        <Clock className="w-3.5 h-3.5 text-blue-600 absolute left-2 top-2.5 pointer-events-none" />
        <span className={formattedDisplay ? 'text-slate-800' : 'text-slate-400'}>
          {formattedDisplay || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>

      {/* Hidden input for HTML form validation */}
      {required && (
        <input
          type="text"
          className="sr-only"
          value={value}
          required={required}
          onChange={() => {}}
          tabIndex={-1}
        />
      )}

      {/* React Time Picker Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-[240px] animate-in fade-in zoom-in-95 duration-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Select Time
          </span>

          {/* Stepper / Toggle Controls */}
          <div className="flex items-center justify-center space-x-1 mb-3 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            {/* Hour select */}
            <select
              value={parsedTime.hour12}
              onChange={(e) => updateTime(Number(e.target.value), parsedTime.minute, parsedTime.isPM)}
              className="px-1.5 py-1 text-xs font-bold font-mono bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-600"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}
                </option>
              ))}
            </select>
            <span className="font-bold text-slate-400">:</span>
            {/* Minute select */}
            <select
              value={parsedTime.minute}
              onChange={(e) => updateTime(parsedTime.hour12, Number(e.target.value), parsedTime.isPM)}
              className="px-1.5 py-1 text-xs font-bold font-mono bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-600"
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}
                </option>
              ))}
            </select>
            {/* AM/PM toggle */}
            <div className="flex bg-slate-200 p-0.5 rounded text-[10px] font-bold">
              <button
                type="button"
                onClick={() => updateTime(parsedTime.hour12, parsedTime.minute, false)}
                className={`px-1.5 py-0.5 rounded transition-colors ${!parsedTime.isPM ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => updateTime(parsedTime.hour12, parsedTime.minute, true)}
                className={`px-1.5 py-0.5 rounded transition-colors ${parsedTime.isPM ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Quick Time Presets */}
          <div className="space-y-1 max-h-[160px] overflow-y-auto">
            {COMMON_TIMES.map((t) => {
              const isSelected = value === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    onChange(t.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2 py-1 text-left rounded-md flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-mono">{t.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

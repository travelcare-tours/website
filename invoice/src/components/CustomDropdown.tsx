import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string | number;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  value: string | number;
  onChange: (value: any) => void;
  options: (DropdownOption | string | number)[];
  placeholder?: string;
  id?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  accentColor?: 'blue' | 'green';
  ariaLabel?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  id,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  disabled = false,
  accentColor = 'blue',
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: DropdownOption[] = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null && 'value' in opt) {
      return opt as DropdownOption;
    }
    const strVal = String(opt);
    const match = strVal.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (match) {
      return {
        value: opt,
        label: match[1].trim(),
        sublabel: match[2].trim(),
      };
    }
    return {
      value: opt,
      label: strVal,
    };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
        const nextIndex = currentIndex < normalizedOptions.length - 1 ? currentIndex + 1 : 0;
        onChange(normalizedOptions[nextIndex].value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : normalizedOptions.length - 1;
        onChange(normalizedOptions[prevIndex].value);
      }
    }
  };

  const isBlue = accentColor === 'blue';
  const activeRingClass = isBlue
    ? 'border-blue-600 ring-2 ring-blue-600/20'
    : 'border-emerald-600 ring-2 ring-emerald-600/20';
  const activeItemBg = isBlue
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  const checkColor = isBlue ? 'text-blue-600' : 'text-emerald-600';
  const chevronFocusColor = isBlue ? 'text-blue-600' : 'text-emerald-600';

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      id={id}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || (typeof value === 'string' ? value : 'Select option')}
        className={`w-full flex items-center justify-between text-left transition-all duration-150 cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'bg-white hover:bg-slate-50/70'
        } ${isOpen ? activeRingClass : 'border-slate-300 hover:border-slate-400'} ${
          triggerClassName || 'px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 shadow-2xs'
        }`}
      >
        <span className="truncate flex-1 pr-2 flex items-center gap-1.5">
          {selectedOption ? (
            <span className="flex items-center gap-2 truncate">
              {selectedOption.icon}
              <span className="truncate font-semibold text-slate-800">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-xs font-normal text-slate-500 truncate hidden sm:inline">
                  ({selectedOption.sublabel})
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? `rotate-180 ${chevronFocusColor}` : 'text-slate-400'
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 focus:outline-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);

            return (
              <div
                key={String(opt.value)}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`group flex items-center justify-between px-3 py-2 my-0.5 rounded-lg text-xs sm:text-sm cursor-pointer transition-all ${
                  isSelected
                    ? `${activeItemBg} font-semibold border`
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {opt.sublabel && (
                    <span
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? 'text-blue-600/80' : 'text-slate-500'
                      }`}
                    >
                      {opt.sublabel}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check className={`w-3.5 h-3.5 shrink-0 ${checkColor} ml-2 animate-in fade-in duration-100`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

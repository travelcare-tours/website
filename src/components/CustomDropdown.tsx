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
  accentColor?: 'green' | 'blue';
  ariaLabel?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  id,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  disabled = false,
  accentColor = 'green',
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options into DropdownOption format
  const normalizedOptions: DropdownOption[] = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null && 'value' in opt) {
      return opt as DropdownOption;
    }
    // If it's a string with parentheses, e.g. "Deluxe 4-Star (Valley/pool views & breakfast)"
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

  // Close when clicking outside
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

  // Handle keyboard navigation
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

  const isGreen = accentColor === 'green';
  const activeRingClass = isGreen
    ? 'border-brand-green ring-2 ring-brand-green/20'
    : 'border-blue-600 ring-2 ring-blue-600/20';
  const activeItemBg = isGreen
    ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
    : 'bg-blue-50 text-blue-700 border-blue-200';
  const checkColor = isGreen ? 'text-brand-green' : 'text-blue-600';
  const chevronFocusColor = isGreen ? 'text-brand-green' : 'text-blue-600';

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      id={id}
    >
      {/* Trigger Button */}
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
        } ${isOpen ? activeRingClass : 'border-slate-200 hover:border-slate-300'} ${
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

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl bg-white border border-slate-200/90 shadow-xl p-1.5 focus:outline-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
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
                className={`group flex items-center justify-between px-3 py-2 my-0.5 rounded-lg text-sm cursor-pointer transition-all ${
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
                      className={`text-xs truncate mt-0.5 ${
                        isSelected ? (isGreen ? 'text-brand-green/80' : 'text-blue-600/80') : 'text-slate-500'
                      }`}
                    >
                      {opt.sublabel}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check className={`w-4 h-4 shrink-0 ${checkColor} ml-2 animate-in fade-in duration-100`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

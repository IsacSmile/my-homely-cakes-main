'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface DatePickerProps {
  id?: string;
  value: string; // ISO date string YYYY-MM-DD
  onChange: (value: string) => void;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  id,
  value,
  onChange,
  minDate,
  maxDate,
  error,
  className = '',
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or current date for popover view
  const selectedDateObj = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDateObj.getMonth()); // 0-11

  // Update view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keydown listener for Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Helper to format date string YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Calendar grid calculation
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleSelectDay = (day: number) => {
    const formatted = formatDateStr(viewYear, viewMonth, day);
    onChange(formatted);
    setIsOpen(false);
  };

  // Quick preset shortcuts
  const todayObj = new Date();
  const todayStr = formatDateStr(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());

  const tomorrowObj = new Date(todayObj);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = formatDateStr(tomorrowObj.getFullYear(), tomorrowObj.getMonth(), tomorrowObj.getDate());

  // Formatted label for display
  const getFormattedLabel = () => {
    if (!value) return 'Select Date';
    const d = new Date(value + 'T00:00:00');
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Clickable input box */}
      <div
        id={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full relative flex items-center justify-between bg-bakery-50 border rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate font-medium cursor-pointer transition-all min-h-[44px] select-none ${
          error
            ? 'border-rose-400 ring-2 ring-rose-500/20'
            : isOpen
            ? 'border-amber-600 ring-2 ring-amber-500/20 bg-white'
            : 'border-bakery-200 hover:border-amber-500 hover:bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="truncate font-semibold text-bakery-chocolate">
            {getFormattedLabel()}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-bakery-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 bg-white border border-bakery-200 rounded-2xl shadow-xl p-4 space-y-3 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header Month Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-bakery-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-bakery-100 text-bakery-700 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif font-bold text-sm text-bakery-chocolate">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-bakery-100 text-bakery-700 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { onChange(todayStr); setIsOpen(false); }}
              className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all ${
                value === todayStr
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => { onChange(tomorrowStr); setIsOpen(false); }}
              className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all ${
                value === tomorrowStr
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              Tomorrow
            </button>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 text-center text-[10px] font-extrabold uppercase text-bakery-400">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDateStr(viewYear, viewMonth, day);
              const isSelected = value === dateStr;
              const isPast = minDate ? dateStr < minDate : false;
              const isFutureMax = maxDate ? dateStr > maxDate : false;
              const isDisabled = isPast || isFutureMax;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-white font-bold shadow-xs scale-105'
                      : isToday
                      ? 'bg-amber-100 text-amber-900 font-extrabold border border-amber-300'
                      : isDisabled
                      ? 'text-bakery-300 cursor-not-allowed opacity-40'
                      : 'hover:bg-bakery-100 text-bakery-chocolate'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

export function parse24to12(time24: string): { hour: number; minute: number; ampm: 'AM' | 'PM' } {
  if (!time24) return { hour: 12, minute: 0, ampm: 'AM' };
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10);
  if (isNaN(h)) h = 12;
  if (isNaN(m)) m = 0;

  const ampm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return { hour: hour12, minute: m, ampm };
}

export function format12to24(hour12: number, minute: number, ampm: 'AM' | 'PM'): string {
  let h24 = hour12;
  if (ampm === 'PM') {
    h24 = hour12 === 12 ? 12 : hour12 + 12;
  } else {
    h24 = hour12 === 12 ? 0 : hour12;
  }
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatDisplay12(time24: string): string {
  const { hour, minute, ampm } = parse24to12(time24);
  return `${hour}:${String(minute).padStart(2, '0')} ${ampm}`;
}

interface TimePickerProps {
  id?: string;
  value: string; // HH:mm 24-hour string format
  onChange: (value: string) => void; // returns HH:mm 24-hour string
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  id,
  value,
  onChange,
  error,
  className = '',
  disabled = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { hour, minute, ampm } = parse24to12(value);

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

  const handleHourSelect = (h: number) => {
    const new24 = format12to24(h, minute, ampm);
    onChange(new24);
  };

  const handleMinuteSelect = (m: number) => {
    const new24 = format12to24(hour, m, ampm);
    onChange(new24);
  };

  const handleAmpmSelect = (newAmpm: 'AM' | 'PM') => {
    const new24 = format12to24(hour, minute, newAmpm);
    onChange(new24);
  };

  const hoursList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutesList = [0, 15, 30, 45]; // Standard 15-min delivery slots

  // Quick preset shortcuts (24-hour values internally, display 12-hour)
  const presets = [
    { label: 'Morning (10:00 AM)', value: '10:00' },
    { label: 'Noon (12:00 PM)', value: '12:00' },
    { label: 'Afternoon (3:00 PM)', value: '15:00' },
    { label: 'Evening (6:00 PM)', value: '18:00' },
    { label: 'Night (8:00 PM)', value: '20:00' },
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
          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="truncate font-bold text-bakery-chocolate">
            {formatDisplay12(value)}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-bakery-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
      </div>

      {/* Popover Time Selector */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-72 sm:w-80 bg-white border border-bakery-200 rounded-2xl shadow-xl p-4 space-y-3.5 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-bakery-100">
            <span className="font-serif font-bold text-xs sm:text-sm text-bakery-chocolate flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Select Delivery Time (12-Hour)</span>
            </span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-mono">
              {formatDisplay12(value)}
            </span>
          </div>

          {/* AM / PM Toggle */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-bakery-400 block mb-1">Period (AM / PM)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAmpmSelect('AM')}
                className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  ampm === 'AM'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-bakery-50 text-bakery-chocolate border-bakery-200 hover:bg-bakery-100'
                }`}
              >
                AM (Morning)
              </button>
              <button
                type="button"
                onClick={() => handleAmpmSelect('PM')}
                className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  ampm === 'PM'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-bakery-50 text-bakery-chocolate border-bakery-200 hover:bg-bakery-100'
                }`}
              >
                PM (Afternoon / Evening)
              </button>
            </div>
          </div>

          {/* Hour Selector (1-12) */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-bakery-400 block mb-1">Hour (1 – 12)</label>
            <div className="grid grid-cols-6 gap-1">
              {hoursList.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourSelect(h)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    hour === h
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-bakery-50 text-bakery-chocolate border-bakery-200 hover:bg-bakery-100'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Minute Selector (00, 15, 30, 45) */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-bakery-400 block mb-1">Minute</label>
            <div className="grid grid-cols-4 gap-1.5">
              {minutesList.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteSelect(m)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    minute === m
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-bakery-50 text-bakery-chocolate border-bakery-200 hover:bg-bakery-100'
                  }`}
                >
                  :{String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-bakery-400 block mb-1">Quick Slots</label>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => { onChange(p.value); setIsOpen(false); }}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all ${
                    value === p.value
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Done button */}
          <div className="pt-2 border-t border-bakery-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { Clock } from 'lucide-react';

interface TimePillPickerProps {
  value: string;
  onChange: (time: string) => void;
  minTime: string;
  maxTime: string;
  label?: string;
  hint?: string;
}

const ASAP_VALUE = 'ASAP';
const INTERVAL_MINUTES = 30;

export function TimePillPicker({
  value,
  onChange,
  minTime,
  maxTime,
  label,
  hint,
}: TimePillPickerProps) {
  const { asapTime, timeSlots } = useMemo(() => {
    const slots: string[] = [];

    // Parse min and max times
    const [minHour, minMin] = minTime.split(':').map(Number);
    const [maxHour, maxMin] = maxTime.split(':').map(Number);

    // ASAP time is the minTime (already accounts for prep time)
    const asapTime = minTime;

    // Start generating slots from the next 30-min interval after minTime
    let currentMinutes = minHour * 60 + minMin;

    // Round up to next 30-minute interval
    const remainder = currentMinutes % INTERVAL_MINUTES;
    if (remainder !== 0) {
      currentMinutes += INTERVAL_MINUTES - remainder;
    } else {
      // If already on interval, go to next one (ASAP covers the first slot)
      currentMinutes += INTERVAL_MINUTES;
    }

    const maxMinutes = maxHour * 60 + maxMin;

    // Generate time slots at 30-min intervals
    while (currentMinutes <= maxMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      const time24 = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      slots.push(time24);
      currentMinutes += INTERVAL_MINUTES;
    }

    return { asapTime, timeSlots: slots };
  }, [minTime, maxTime]);

  // Format time for display (12-hour format)
  const formatTimeDisplay = (time24: string) => {
    const [hours, mins] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`;
  };

  // Handle selection - ASAP stores the actual minTime value
  const handleSelect = (timeValue: string) => {
    if (timeValue === ASAP_VALUE) {
      onChange(asapTime);
    } else {
      onChange(timeValue);
    }
  };

  const isAsapSelected = value === asapTime;

  return (
    <div>
      {label && (
        <label className="block text-sm text-gray-400 mb-3">
          <Clock className="w-4 h-4 inline mr-2" />
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-2">
        {/* ASAP Option */}
        <button
          type="button"
          onClick={() => handleSelect(ASAP_VALUE)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all
            ${isAsapSelected
              ? 'bg-amarillo text-negro shadow-lg scale-105'
              : 'bg-negro border border-gray-600 text-gray-300 hover:border-amarillo hover:text-amarillo'
            }
          `}
        >
          ASAP (~{formatTimeDisplay(asapTime)})
        </button>

        {/* Time Slots */}
        {timeSlots.map((time) => {
          const isSelected = value === time && !isAsapSelected;
          return (
            <button
              key={time}
              type="button"
              onClick={() => handleSelect(time)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-amarillo text-negro shadow-lg scale-105'
                  : 'bg-negro border border-gray-600 text-gray-300 hover:border-amarillo hover:text-amarillo'
                }
              `}
            >
              {formatTimeDisplay(time)}
            </button>
          );
        })}
      </div>

      {hint && (
        <p className="text-xs text-gray-500 mt-3">{hint}</p>
      )}

      {timeSlots.length === 0 && (
        <p className="text-sm text-gray-500 italic mt-2">Only ASAP pickup available</p>
      )}
    </div>
  );
}

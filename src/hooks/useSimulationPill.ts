import { useState, useEffect } from 'react';

export type PillChoice = 'red' | 'blue' | null;

const STORAGE_KEY = 'simulation_pill_choice';

/**
 * Hook to manage the user's red/blue pill choice for the Simulation theme
 * Stored in localStorage for persistence across sessions
 */
export const useSimulationPill = () => {
  const [pill, setPillState] = useState<PillChoice>(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'red' || stored === 'blue') {
        return stored;
      }
    }
    return null;
  });

  const setPill = (choice: PillChoice) => {
    setPillState(choice);
    if (typeof localStorage !== 'undefined') {
      if (choice) {
        localStorage.setItem(STORAGE_KEY, choice);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const clearPill = () => setPill(null);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const val = e.newValue;
        if (val === 'red' || val === 'blue') {
          setPillState(val);
        } else {
          setPillState(null);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { pill, setPill, clearPill, hasPill: pill !== null };
};

/**
 * Get the current pill choice without React hooks (for non-component use)
 */
export const getSimulationPill = (): PillChoice => {
  if (typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'red' || stored === 'blue') return stored;
  return null;
};

/**
 * Get the pill emoji for display
 */
export const getPillEmoji = (pill: PillChoice): string => {
  if (pill === 'red') return '🔴';
  if (pill === 'blue') return '🔵';
  return '';
};

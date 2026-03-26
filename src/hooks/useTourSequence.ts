import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store';

const TOUR_SEQUENCE_KEY = 'tourSequenceComplete';
const CURRENT_TOUR_INDEX_KEY = 'currentTourIndex';

interface TourStep {
  path: string;
  screenKey: string;
  name: string;
}

const TOUR_SEQUENCE: TourStep[] = [
  { path: '/whisperer', screenKey: 'whisperer', name: 'Entrepreneur Whisperer' },
  { path: '/dashboard', screenKey: 'dashboard', name: 'Dashboard' },
  { path: '/roadmap', screenKey: 'roadmap', name: 'Roadmap' },
  { path: '/signals', screenKey: 'signals', name: 'Market Signals' },
  { path: '/passport', screenKey: 'passport', name: 'Passport' },
  { path: '/tools', screenKey: 'tools', name: 'Tools' },
  { path: '/applications', screenKey: 'applications', name: 'Applications' },
  { path: '/fundraising', screenKey: 'fundraising', name: 'Fundraising' },
  { path: '/community', screenKey: 'community', name: 'Community' },
  { path: '/settings', screenKey: 'settings', name: 'Settings' },
];

export function useTourSequence() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSequenceActive, setIsSequenceActive] = useState(false);

  useEffect(() => {
    const sequenceComplete = localStorage.getItem(TOUR_SEQUENCE_KEY);
    const currentIndex = localStorage.getItem(CURRENT_TOUR_INDEX_KEY);

    if (!sequenceComplete && currentIndex !== null) {
      setIsSequenceActive(true);
    }
  }, []);

  const startTourSequence = () => {
    localStorage.setItem(CURRENT_TOUR_INDEX_KEY, '0');
    setIsSequenceActive(true);
    navigate(TOUR_SEQUENCE[0].path);
  };

  const moveToNextTour = () => {
    const currentIndexStr = localStorage.getItem(CURRENT_TOUR_INDEX_KEY);
    if (currentIndexStr === null) return;

    const currentIndex = parseInt(currentIndexStr);
    const nextIndex = currentIndex + 1;

    if (nextIndex < TOUR_SEQUENCE.length) {
      localStorage.setItem(CURRENT_TOUR_INDEX_KEY, nextIndex.toString());
      navigate(TOUR_SEQUENCE[nextIndex].path);
    } else {
      // Sequence complete
      localStorage.setItem(TOUR_SEQUENCE_KEY, 'true');
      localStorage.removeItem(CURRENT_TOUR_INDEX_KEY);
      setIsSequenceActive(false);
    }
  };

  const getCurrentTourIndex = (): number | null => {
    const indexStr = localStorage.getItem(CURRENT_TOUR_INDEX_KEY);
    return indexStr ? parseInt(indexStr) : null;
  };

  const isCurrentScreen = (screenKey: string): boolean => {
    const currentIndex = getCurrentTourIndex();
    if (currentIndex === null) return false;
    return TOUR_SEQUENCE[currentIndex]?.screenKey === screenKey;
  };

  return {
    isSequenceActive,
    startTourSequence,
    moveToNextTour,
    isCurrentScreen,
    getCurrentTourIndex,
  };
}

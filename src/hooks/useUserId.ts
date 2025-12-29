import { useState, useEffect } from 'react';

const USER_ID_KEY = 'build_beyond_user_id';

// Generate a unique user ID
const generateUserId = (): string => {
  return `user-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export function useUserId(): string {
  const [userId, setUserId] = useState<string>(() => {
    // Try to get existing user ID from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(USER_ID_KEY);
      if (stored) return stored;
    }
    return '';
  });

  useEffect(() => {
    // If no user ID exists, generate and store one
    if (!userId) {
      const newUserId = generateUserId();
      localStorage.setItem(USER_ID_KEY, newUserId);
      setUserId(newUserId);
    }
  }, [userId]);

  return userId;
}

// Export a function to get user ID synchronously (for non-hook contexts)
export function getUserId(): string {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = generateUserId();
      localStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  }
  return generateUserId();
}

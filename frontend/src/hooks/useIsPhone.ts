import { useSyncExternalStore } from 'react';

/** Phone layout breakpoint; matches the 640px rules in theme.css and phone.css. */
export const PHONE_QUERY = '(max-width: 640px)';

export const isPhoneViewport = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia(PHONE_QUERY).matches;

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

export const useIsPhone = (): boolean => useSyncExternalStore(subscribe, isPhoneViewport, () => false);

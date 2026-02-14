'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
  Suspense,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

// Isolated component for useSearchParams — has its own Suspense boundary
// so it can never hide page content when it suspends during navigation
function SearchParamsWatcher({ onSearchParamsChange }: { onSearchParamsChange: () => void }) {
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSearchParamsChange();
  }, [searchParams, onSearchParamsChange]);

  return null;
}

function LoadingProviderInner({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const loadingCount = useRef(0);

  // Track navigation for page transition loading
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  const resetLoading = useCallback(() => {
    setIsLoading(false);
    loadingCount.current = 0;
    setLoadingMessage('');
  }, []);

  // Handle route changes (pathname only — searchParams handled separately)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    resetLoading();
  }, [pathname, resetLoading]);

  const startLoading = useCallback((message: string = '') => {
    loadingCount.current += 1;
    setIsLoading(true);
    if (message) {
      setLoadingMessage(message);
    }
  }, []);

  const stopLoading = useCallback(() => {
    loadingCount.current = Math.max(0, loadingCount.current - 1);
    if (loadingCount.current === 0) {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  // Wrapper for async operations
  const withLoading = useCallback(
    async <T,>(promise: Promise<T>, message?: string): Promise<T> => {
      startLoading(message);
      try {
        const result = await promise;
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        startLoading,
        stopLoading,
        withLoading,
      }}
    >
      {/* SearchParams watcher in its own Suspense boundary — when it suspends
          during navigation, only this null-rendering component is affected,
          not the page content */}
      <Suspense fallback={null}>
        <SearchParamsWatcher onSearchParamsChange={resetLoading} />
      </Suspense>
      {children}
    </LoadingContext.Provider>
  );
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  return <LoadingProviderInner>{children}</LoadingProviderInner>;
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

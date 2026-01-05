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

function LoadingProviderInner({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const loadingCount = useRef(0);

  // Track navigation for page transition loading
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  // Handle route changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Stop any navigation-triggered loading when route changes complete
    setIsLoading(false);
    loadingCount.current = 0;
    setLoadingMessage('');
  }, [pathname, searchParams]);

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
      {children}
    </LoadingContext.Provider>
  );
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  return (
    <Suspense fallback={null}>
      <LoadingProviderInner>{children}</LoadingProviderInner>
    </Suspense>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

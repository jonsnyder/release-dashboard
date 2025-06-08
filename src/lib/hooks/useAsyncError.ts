'use client';

import { useState, useCallback } from 'react';

interface AsyncErrorState {
  loading: boolean;
  error: Error | null;
}

export default function useAsyncError(): [
  AsyncErrorState,
  (fn: () => Promise<any>) => void
] {
  const [state, setState] = useState<AsyncErrorState>({
    loading: false,
    error: null,
  });

  const handleAsync = useCallback((fn: () => Promise<any>): void => {
    setState({ loading: true, error: null });
    fn()
      .then(() => {
        setState({ loading: false, error: null });
      })
      .catch((error) => {
        setState({ loading: false, error: error as Error });
      });
  }, []);

  return [state, handleAsync];
}

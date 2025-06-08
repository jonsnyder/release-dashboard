import { useEffect, useState } from 'react';
import { AsyncStatus } from '../types';

type AsyncHandler = (func: () => Promise<void>) => void;
type Refresh = (handler: AsyncHandler) => void;

export default function useAsync(refresh: Refresh, dependencies: unknown[]): AsyncStatus {
  const [status, setStatus] = useState<AsyncStatus>({ type: 'loading' });

  const handler: AsyncHandler = async (func) => {
    setStatus({ type: 'loading' });
    try {
      await func();
      setStatus({ type: 'complete' });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
  };

  useEffect(() => {
    refresh(handler);
  }, dependencies);

  return status;
}

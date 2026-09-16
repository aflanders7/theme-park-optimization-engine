import { useCallback, useEffect, useState } from 'react';
import {
  getCrowdCalendar,
  type CrowdCalendarResponse,
} from '../lib/api';

type Status = 'loading' | 'success' | 'error';

// Fetches crowd predictions for exactly one month, refetching whenever
// year/month changes. Only the requested month is ever loaded.
export function useCrowdCalendar(year: number, month: number) {
  const [data, setData] = useState<CrowdCalendarResponse | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  const fetchMonth = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await getCrowdCalendar(year, month);

      setData(response);
      setStatus('success');
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Could not load crowd predictions for this month.';

      setError(message);
      setStatus('error');
    }
  }, [year, month]);

  useEffect(() => {
    fetchMonth();
  }, [fetchMonth]);

  return {
    data,
    status,
    error,
    refetch: fetchMonth,
  };
}
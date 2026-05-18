import { useEffect } from 'react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { fetchAdminRequests, setPendingRequests } from '../slices/requestsSlice';

const POLL_INTERVAL_MS = 30_000;

export function usePendingRequestsListener(organizationId: string | null) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!organizationId) return;

    const poll = async () => {
      try {
        const result = await dispatch(fetchAdminRequests('pending')).unwrap();
        dispatch(setPendingRequests(result));
      } catch {
        // ネットワークエラー等は無視して次のポーリングで再試行
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [organizationId, dispatch]);
}

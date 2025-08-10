import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { hydrateFromStorage } from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) dispatch(hydrateFromStorage());
  }, [dispatch, user]);

  return { user };
};

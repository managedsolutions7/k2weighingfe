import { useAppSelector } from '@/store';

/**
 * Returns helper to append plant scope for supervisors automatically.
 */
export const useScopedParams = () => {
  const user = useAppSelector((s) => s.auth.user);

  const withScope = <T extends Record<string, unknown>>(params?: T): T => {
    if (user?.role === 'supervisor' && user.plantId) {
      return {
        ...((params ?? {}) as Record<string, unknown>),
        plantId: user.plantId,
      } as unknown as T;
    }
    return params ?? ({} as T);
  };

  return { user, withScope };
};

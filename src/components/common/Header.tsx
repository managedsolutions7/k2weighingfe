import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/common/Modal';

const Header = () => {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <header className="w-full flex items-center justify-between border-b mb-4 pb-2">
        <div className="font-semibold">Biofuel Management</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">{user?.name ?? user?.username}</span>
          <button
            onClick={() => setConfirm(true)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </header>
      <ConfirmDialog
        open={confirm}
        title="Logout"
        message="Are you sure you want to logout?"
        onCancel={() => setConfirm(false)}
        onConfirm={() => dispatch(logout())}
      />
    </>
  );
};

export default Header;

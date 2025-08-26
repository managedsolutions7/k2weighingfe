import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/common/Modal';
import { Menu } from 'lucide-react';
import useWindowSize from '@/hooks/useWindowSize';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [confirm, setConfirm] = useState(false);
  const { width: windowWidth } = useWindowSize();

  return (
    <>
      <a href="#main" className="skip-to-content">
        Skip to content
      </a>
      <header className="w-full flex items-center justify-between border-b mb-4 py-2 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40 px-2 sm:px-4 ">
        <div className="flex items-center gap-2">
          {windowWidth < 1024 && onMenuClick && (
            <button
              type="button"
              className="sm:hidden btn btn-outline px-2 py-2"
              aria-label="Open menu"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="font-semibold">Biofuel Management</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">{user?.name ?? user?.username}</span>
          <button onClick={() => setConfirm(true)} className="btn btn-outline">
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

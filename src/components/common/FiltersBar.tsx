import type { ReactNode } from 'react';

interface FiltersBarProps {
  children: ReactNode;
  onReset?: () => void;
}

const FiltersBar = ({ children, onReset }: FiltersBarProps) => {
  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      {children}
      {onReset && (
        <button className="ml-auto px-3 py-2 border rounded" onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  );
};

export default FiltersBar;

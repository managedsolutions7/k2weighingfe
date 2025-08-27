import { useEffect, useMemo, useRef, useState } from 'react';
import type { Option } from '@/hooks/useOptions';

interface AsyncSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loadOptions: (q: string) => Promise<Option[]>;
  ariaLabel?: string;
  disabled?: boolean;
}

const useDebounced = (value: string, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

const AsyncSelect = ({
  value,
  onChange,
  placeholder = 'Search…',
  loadOptions,
  ariaLabel,
  disabled = false,
}: AsyncSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounced(query, 300);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const opts = await loadOptions(debounced);
        setOptions(opts);
      } finally {
        setLoading(false);
      }
    };
    if (open && !disabled) void run();
  }, [debounced, loadOptions, open, disabled]);

  // Load initial options when value is provided (for editing)
  useEffect(() => {
    const loadInitialOptions = async () => {
      if (value && !open && options.length === 0) {
        setLoading(true);
        try {
          const opts = await loadOptions('');
          setOptions(opts);
        } finally {
          setLoading(false);
        }
      }
    };
    void loadInitialOptions();
  }, [value, open, options.length, loadOptions]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!inputRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!inputRef.current.parentElement?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? '',
    [options, value],
  );

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        className="border rounded px-3 py-2 w-full"
        placeholder={placeholder}
        value={open ? query : selectedLabel}
        onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
        onFocus={() => {
          if (!disabled) setOpen(true);
        }}
        disabled={disabled}
      />
      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-56 overflow-auto">
          {loading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
          {!loading && options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No results</div>
          )}
          {!loading &&
            options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 hover:bg-gray-50 ${
                  o.value === value ? 'bg-blue-50' : ''
                }`}
              >
                {o.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default AsyncSelect;

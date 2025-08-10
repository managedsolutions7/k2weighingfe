interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ placeholder = 'Search…', value, onChange }: SearchBarProps) => {
  return (
    <input
      className="border rounded px-3 py-2 w-full max-w-sm"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange((e.target as HTMLInputElement).value)}
    />
  );
};

export default SearchBar;

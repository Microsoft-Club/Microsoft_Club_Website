type SearchFilterProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const SearchFilter = ({
  value,
  onChange,
  placeholder = "Search...",
}: SearchFilterProps) => {
  return (
    <div className="w-full max-w-md mb-4">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search items"
        className="w-full border-2 border-black bg-white px-3 py-2 text-sm shadow-retro focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
};

export default SearchFilter;

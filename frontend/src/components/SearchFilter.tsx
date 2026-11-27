type SearchFilterProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
};

/** Shared search box for the events, blogs, and projects lists. */
const SearchFilter = ({ value, onChange, placeholder, label }: SearchFilterProps) => (
  <label className="list-search">
    <span className="sr-only">{label}</span>
    <i className="icon-magnifier" aria-hidden="true" />
    <input
      className="input"
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
    {value && (
      <button type="button" className="list-search-clear" onClick={() => onChange('')} aria-label="Clear search">
        <i className="icon-close" aria-hidden="true" />
      </button>
    )}
  </label>
);

export default SearchFilter;

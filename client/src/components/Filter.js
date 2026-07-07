import './Filter.css';

function Filter({ breed, onChange, onClear }) {
  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Filter by breed..."
        value={breed}
        onChange={(e) => onChange(e.target.value)}
        className="filter-input"
      />
      {breed && (
        <button className="filter-clear" onClick={onClear}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}

export default Filter;

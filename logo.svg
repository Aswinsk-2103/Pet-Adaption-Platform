import './TraitSelector.css';

const ALL_TRAITS = [
  'Friendly', 'Active', 'Calm', 'Playful',
  'Good with Kids', 'Vaccinated', 'Trained', 'Indoor', 'Outdoor',
];

function TraitSelector({ selected, onChange }) {
  const safeSelected = Array.isArray(selected) ? selected : [];
  const toggle = (trait) => {
    if (safeSelected.includes(trait)) {
      onChange(safeSelected.filter((t) => t !== trait));
    } else {
      onChange([...safeSelected, trait]);
    }
  };

  return (
    <div className="trait-selector">
      <div className="trait-options">
        {ALL_TRAITS.map((trait) => (
          <button
            key={trait}
            type="button"
            className={`trait-option ${safeSelected.includes(trait) ? 'selected' : ''}`}
            onClick={() => toggle(trait)}
          >
            {safeSelected.includes(trait) ? '✓ ' : ''}{trait}
          </button>
        ))}
      </div>
      {safeSelected.length > 0 && (
        <div className="trait-selected-chips">
          {safeSelected.map((t) => (
            <span key={t} className="trait-chip-selected">
              {t}
              <button type="button" className="chip-remove" onClick={() => toggle(t)}>✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default TraitSelector;

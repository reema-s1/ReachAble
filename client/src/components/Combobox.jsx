import { useId, useRef, useState } from 'react';

// APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
// (editable combobox with list autocomplete)
// role="combobox", aria-expanded, aria-controls, aria-activedescendant, filtered listbox.
export default function Combobox({ label, options, value, onChange, hint }) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  function commit(option) {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleInputChange(event) {
    const next = event.target.value;
    setInputValue(next);
    onChange(next);
    setIsOpen(true);
    setActiveIndex(-1);
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
        return;
      }
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && filtered[activeIndex]) {
        event.preventDefault();
        commit(filtered[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleBlur(event) {
    if (!wrapperRef.current.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  }

  const activeOptionId =
    activeIndex >= 0 && filtered[activeIndex] ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div className="field combobox-wrapper" ref={wrapperRef} onBlur={handleBlur}>
      <label htmlFor={inputId}>{label}</label>
      {hint && (
        <p className="hint" id={`${baseId}-hint`}>
          {hint}
        </p>
      )}
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        aria-autocomplete="list"
        aria-describedby={hint ? `${baseId}-hint` : undefined}
        autoComplete="off"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && filtered.length > 0 && (
        <ul id={listboxId} role="listbox" className="combobox-listbox" aria-label={label}>
          {filtered.map((option, index) => (
            <li
              key={option}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className="combobox-option"
              onMouseDown={(e) => {
                e.preventDefault();
                commit(option);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

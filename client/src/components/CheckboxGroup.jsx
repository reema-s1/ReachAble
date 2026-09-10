export default function CheckboxGroup({ legend, options, selected, onChange, name }) {
  function toggle(value) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  }

  return (
    <fieldset>
      <legend>{legend}</legend>
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        return (
          <div className="checkbox-row" key={option.value}>
            <input
              type="checkbox"
              id={id}
              name={name}
              value={option.value}
              checked={selected.includes(option.value)}
              onChange={() => toggle(option.value)}
            />
            <label htmlFor={id}>{option.label}</label>
          </div>
        );
      })}
    </fieldset>
  );
}

export function RadioGroup({ legend, options, value, onChange, name }) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        return (
          <div className="checkbox-row" key={option.value}>
            <input
              type="radio"
              id={id}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <label htmlFor={id}>{option.label}</label>
          </div>
        );
      })}
    </fieldset>
  );
}

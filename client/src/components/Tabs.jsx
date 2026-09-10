import { useRef } from 'react';

// APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
// role="tablist"/"tab"/"tabpanel", arrow-key navigation, aria-selected.
// Panels are rendered by the caller; this component only owns the tablist.
export default function Tabs({ tabs, activeId, onChange, label }) {
  const tabRefs = useRef({});

  function focusTab(id) {
    onChange(id);
    tabRefs.current[id]?.focus();
  }

  function handleKeyDown(event, index) {
    const lastIndex = tabs.length - 1;
    let nextIndex = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = lastIndex;
    } else {
      return;
    }
    event.preventDefault();
    focusTab(tabs[nextIndex].id);
  }

  return (
    <div className="tabs-list" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => (tabRefs.current[tab.id] = el)}
          role="tab"
          type="button"
          id={`tab-${tab.id}`}
          aria-selected={activeId === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          tabIndex={activeId === tab.id ? 0 : -1}
          className="tab"
          onClick={() => onChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ id, activeId, children }) {
  if (id !== activeId) return null;
  return (
    <div role="tabpanel" id={`tabpanel-${id}`} aria-labelledby={`tab-${id}`} tabIndex={0}>
      {children}
    </div>
  );
}

'use client';

import { useId, useState } from 'react';
import { useDebounce } from '../lib/use-debounce';

type AutocompleteOption = { value: string; label: string };

type Props = {
  label: string;
  options: readonly AutocompleteOption[];
  value: string;
  onSelect: (value: string) => void;
};

// Case-insensitive match on the label; an empty query matches everything.
function filterOptions(options: readonly AutocompleteOption[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter((o) => o.label.toLowerCase().includes(q));
}

// Combobox with a listbox (ARIA "list autocomplete" pattern). The input shows
// the selected option; typing filters the list after a short debounce.
export function Autocomplete({ label, options, value, onSelect }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const debouncedQuery = useDebounce(query);

  const selected = options.find((o) => o.value === value);
  const matches = filterOptions(options, editing ? debouncedQuery : '');
  const activeIndex = Math.min(active, matches.length - 1);
  const showList = open && matches.length > 0;

  function reset() {
    setQuery('');
    setEditing(false);
    setOpen(false);
  }

  function commit(option: AutocompleteOption) {
    onSelect(option.value);
    reset();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (matches.length === 0) return;
      setOpen(true);
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((activeIndex + step + matches.length) % matches.length);
    } else if (e.key === 'Enter' && open) {
      // While the debounce is pending the list is stale, use the live text
      const pending = editing && query !== debouncedQuery;
      const option = pending
        ? filterOptions(options, query)[0]
        : matches[activeIndex];
      if (option) {
        e.preventDefault();
        commit(option);
      }
    } else if (e.key === 'Escape') {
      reset();
    }
  }

  return (
    <div className="autocomplete">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? optionId(activeIndex) : undefined}
        autoComplete="off"
        value={editing ? query : (selected?.label ?? '')}
        onChange={(e) => {
          setQuery(e.target.value);
          setEditing(true);
          setOpen(true);
          setActive(0);
        }}
        onFocus={(e) => {
          e.target.select();
          setOpen(true);
        }}
        onClick={() => setOpen(true)}
        onBlur={reset}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <ul id={listId} role="listbox" aria-label={label}>
          {matches.map((o, i) => (
            <li
              key={o.value}
              id={optionId(i)}
              role="option"
              aria-selected={o.value === value}
              data-active={i === activeIndex || undefined}
              // keep focus in the input so blur does not close the list first
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(o)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
      <p role="status" aria-live="polite" className="muted">
        {open && matches.length === 0 ? 'No results found' : ''}
      </p>
    </div>
  );
}

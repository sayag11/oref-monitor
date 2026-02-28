import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  SearchWrapper,
  SearchInput,
  SearchIcon,
  AutocompleteList,
  AutocompleteItem,
} from './styles';

interface CitySearchProps {
  cities: string[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

const CitySearch: React.FC<CitySearchProps> = ({ cities, selectedCity, onSelectCity }) => {
  const [query, setQuery] = useState(selectedCity);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? cities.filter((c) => c.includes(query)).slice(0, 20)
    : [];

  useEffect(() => {
    setQuery(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = useCallback(
    (city: string) => {
      setQuery(city);
      setIsOpen(false);
      setHighlightedIndex(-1);
      onSelectCity(city);
    },
    [onSelectCity]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectCity(filtered[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <SearchWrapper ref={wrapperRef}>
      <SearchInput
        ref={inputRef}
        className="search alert_from shelter_search alert_city ui-autocomplete-input"
        type="text"
        placeholder="חפש עיר..."
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length > 0 && setIsOpen(true)}
        aria-label="חיפוש עיר"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="city-autocomplete-list"
        role="combobox"
        tabIndex={0}
        autoComplete="off"
      />
      <SearchIcon aria-hidden="true">🔍</SearchIcon>

      {isOpen && filtered.length > 0 && (
        <AutocompleteList
          id="city-autocomplete-list"
          role="listbox"
          aria-label="רשימת ערים"
        >
          {filtered.map((city, index) => (
            <AutocompleteItem
              key={city}
              $highlighted={index === highlightedIndex}
              role="option"
              aria-selected={index === highlightedIndex}
              tabIndex={-1}
              onClick={() => handleSelectCity(city)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {city}
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      )}
    </SearchWrapper>
  );
};

export default CitySearch;

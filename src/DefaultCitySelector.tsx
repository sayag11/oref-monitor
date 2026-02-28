import React, { useState, useRef, useEffect } from 'react';
import {
  DefaultCityWrapper,
  DefaultCityButton,
  DefaultCityDropdown,
  DefaultCityInput,
  DefaultCityOption,
  DefaultCityList,
  DefaultCityLabel,
} from './styles';

const STORAGE_KEY = 'oref_default_city';

export const getStoredCity = (): string | null =>
  localStorage.getItem(STORAGE_KEY);

export const storeCity = (city: string): void =>
  localStorage.setItem(STORAGE_KEY, city);

interface DefaultCitySelectorProps {
  cities: string[];
  currentCity: string;
  onCityChange: (city: string) => void;
}

const DefaultCitySelector: React.FC<DefaultCitySelectorProps> = ({
  cities,
  currentCity,
  onCityChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = search
    ? cities.filter((c) => c.includes(search)).slice(0, 15)
    : cities.slice(0, 15);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (city: string) => {
    storeCity(city);
    onCityChange(city);
    setIsOpen(false);
    setSearch('');
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    }
  };

  return (
    <DefaultCityWrapper ref={wrapperRef} onKeyDown={handleKeyDown}>
      <DefaultCityLabel>עיר ברירת מחדל:</DefaultCityLabel>
      <DefaultCityButton
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="בחירת עיר ברירת מחדל"
        tabIndex={0}
      >
        📍 {currentCity || 'בחר עיר'}
      </DefaultCityButton>

      {isOpen && (
        <DefaultCityDropdown role="dialog" aria-label="בחירת עיר ברירת מחדל">
          <DefaultCityInput
            ref={inputRef}
            type="text"
            placeholder="חפש עיר..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="חיפוש עיר ברירת מחדל"
            autoComplete="off"
          />
          <DefaultCityList role="listbox">
            {filtered.map((city) => (
              <DefaultCityOption
                key={city}
                $active={city === currentCity}
                role="option"
                aria-selected={city === currentCity}
                onClick={() => handleSelect(city)}
              >
                {city}
              </DefaultCityOption>
            ))}
            {filtered.length === 0 && (
              <DefaultCityOption $active={false} disabled>
                לא נמצאו תוצאות
              </DefaultCityOption>
            )}
          </DefaultCityList>
        </DefaultCityDropdown>
      )}
    </DefaultCityWrapper>
  );
};

export default DefaultCitySelector;

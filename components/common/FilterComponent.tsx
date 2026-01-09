'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronDown, Check, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  title: string;
  options: Array<{ value: string; label: string }>;
  selected: string | string[];
  onChange: (value: string) => void;
  resetValue?: string;
  className?: string;
}

export const FilterSection = ({
  title,
  options,
  selected,
  onChange,
  resetValue = "",
  className,
}: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cek apakah filter ini sedang aktif (memiliki nilai selain resetValue)
  const isActive = selected !== resetValue && selected.length > 0;

  // Mendapatkan label dari value yang terpilih
  const getSelectedLabel = useCallback(() => {
    if (isActive) {
      // Jika selected adalah array, ambil yang pertama (atau join jika multiselect)
      const val = Array.isArray(selected) ? selected[0] : selected;
      return options.find((opt) => opt.value == val)?.label;
    }
    return null;
  }, [selected, isActive, options]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleSelect = (value: string) => {
    onChange(value === "__RESET__" ? resetValue : value);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(resetValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative min-w-[140px]", className)} ref={dropdownRef}>
      {/* Label kecil di atas filter (opsional, untuk memperjelas konteks saat aktif) */}
      {isActive && (
        <span className="absolute -top-2 left-3 z-10 bg-[#1a1a1a] px-1 text-[10px] text-rose-500 font-bold uppercase tracking-wider">
          {title}
        </span>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-rose-500/20",
          isActive
            ? "bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-[0_0_15px_-5px_rgba(244,63,94,0.3)]" // Style saat Aktif
            : "bg-[#222222]/60 hover:bg-[#2a2a2a] border-white/5 text-gray-400 hover:text-gray-200 hover:border-white/10" // Style Default
        )}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {!isActive && <Filter className="w-3.5 h-3.5 opacity-50" />}
          <span className="truncate">
            {isActive ? getSelectedLabel() : title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isActive && (
            <div
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer mr-1"
              role="button"
              aria-label="Clear filter"
            >
              <X className="w-3.5 h-3.5" />
            </div>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isOpen ? "rotate-180" : "",
              isActive ? "text-rose-500" : "text-gray-500"
            )}
          />
        </div>
      </button>

      {/* Dropdown Content */}
      <div
        className={cn(
          "absolute z-50 w-full min-w-[180px] mt-2 origin-top-left",
          "bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden",
          "transition-all duration-200 ease-out",
          isOpen
            ? "transform scale-100 opacity-100 translate-y-0"
            : "transform scale-95 opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-1">
          {options.map((option) => {
            const isSelected = Array.isArray(selected) 
              ? selected.includes(option.value) 
              : selected == option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full px-3 py-2.5 text-sm text-left rounded-lg mb-0.5 last:mb-0 transition-all duration-200",
                  "flex items-center justify-between group",
                  isSelected
                    ? "bg-rose-600 text-white font-medium shadow-md"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ... (Simpan exports genres, years, lang, dll sama seperti sebelumnya)
// Pastikan export data (genres, years, dll) tetap ada di bawah sini
export const genres = [
  { value: "28", label: "Action" },
  { value: "12", label: "Adventure" },
  { value: "16", label: "Animation" },
  { value: "35", label: "Comedy" },
  { value: "80", label: "Crime" },
  { value: "18", label: "Drama" },
  { value: "10751", label: "Family" },
  { value: "14", label: "Fantasy" },
  { value: "27", label: "Horror" },
  { value: "10749", label: "Romance" },
  { value: "878", label: "Science Fiction" },
  { value: "53", label: "Thriller" },
  { value: "10752", label: "War" },
  { value: "37", label: "Western" },
];

export const years = [
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2021", label: "2021" },
  { value: "2020", label: "2020" },
  { value: "2019", label: "2019" },
  { value: "2018", label: "2018" },
  { value: "2017", label: "2017" },
  { value: "2016", label: "2016" },
  { value: "2015", label: "2015" },
  { value: "2014", label: "2014" },
  { value: "2013", label: "2013" },
  { value: "2012", label: "2012" },
  { value: "2011", label: "2011" },
  { value: "2010", label: "2010" },
];

export const lang = [
  { value: "en", label: "English" },
  { value: "id", label: "Indonesia" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Mandarin" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "ru", label: "Russian" },
];

export const ratings = [
  { value: "0", label: "Semua Rating" }, // Sedikit ubah label
  { value: "1", label: "⭐ 1+" },
  { value: "2", label: "⭐⭐ 2+" },
  { value: "3", label: "⭐⭐⭐ 3+" },
  { value: "4", label: "⭐⭐⭐⭐ 4+" },
  { value: "5", label: "⭐⭐⭐⭐⭐ 5" },
];

export const types = [
  { value: "all", label: "Semua Tipe" },
  { value: "movie", label: "Film" },
  { value: "tv", label: "TV Show" },
];
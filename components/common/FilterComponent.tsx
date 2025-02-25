import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";


interface FilterSectionProps {
  title: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (value: string[]) => void;
  multi?: boolean;
}
export const FilterSection = ({
  title,
  options,
  selected,
  onChange,
  multi = false,
}: FilterSectionProps) => {
  const displayValue = options.find((opt) => opt.value === selected)?.label || title;

  return (
    <Select
      value={multi ? undefined : selected[0]}
      onValueChange={onChange}
    >
      <SelectTrigger className="w-[160px] text-left">
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {displayValue}
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

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
  { value: "0", label: "Semua" },
  { value: "1", label: "⭐" },
  { value: "2", label: "⭐⭐" },
  { value: "3", label: "⭐⭐⭐" },
  { value: "4", label: "⭐⭐⭐⭐" },
  { value: "5", label: "⭐⭐⭐⭐⭐" },
];

export const types = [
  { value: "all", label: "Semua" },
  { value: "movie", label: "Film" },
  { value: "tv", label: "TV Show" },
];
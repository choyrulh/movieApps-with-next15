import { cn } from "@/lib/utils";
import { StarIcon } from "@heroicons/react/24/solid";

interface RatingProps {
  value: number;
  className?: string;
}

export const Rating = ({ value, className }: RatingProps) => {
  const normalizedValue = value / 2; // Convert 10-point scale to 5 stars
  const fullStars = Math.floor(normalizedValue);
  const hasHalfStar = normalizedValue % 1 >= 0.5;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(5)].map((_, index) => (
        <StarIcon
          key={index}
          className={cn(
            "w-5 h-5",
            index < fullStars
              ? "text-amber-400"
              : index === fullStars && hasHalfStar
              ? "text-amber-400"
              : "text-slate-600"
          )}
        />
      ))}
      <span className="ml-2 text-slate-400 text-sm">
        {normalizedValue.toFixed(1)}
      </span>
    </div>
  );
};

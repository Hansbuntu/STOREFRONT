import { Seller } from "../../types";

interface SellerRatingProps {
  seller: Seller;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SellerRating({
  seller,
  showCount = true,
  size = "md",
}: SellerRatingProps) {
  const starSize = size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm";
  const fullStars = Math.floor(seller.ratingAvg);
  const hasHalfStar = seller.ratingAvg % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <span key={i} className={`${starSize} text-yellow-400`}>
                ★
              </span>
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <span key={i} className={`${starSize} text-yellow-400`}>
                ☆
              </span>
            );
          } else {
            return (
              <span key={i} className={`${starSize} text-gray-300`}>
                ★
              </span>
            );
          }
        })}
      </div>
      {showCount && (
        <span className="text-xs text-gray-600 ml-1">
          ({seller.feedbackCount})
        </span>
      )}
    </div>
  );
}


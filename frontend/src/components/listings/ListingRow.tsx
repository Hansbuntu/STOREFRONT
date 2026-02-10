import { Link } from "react-router-dom";
import { Listing } from "../../types";

interface ListingRowProps {
  listing: Listing;
}

export function ListingRow({ listing }: ListingRowProps) {
  const conditionLabels: Record<string, string> = {
    new: "New",
    like_new: "Like New",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return "1 week ago";
    return `${diffWeeks} weeks ago`;
  };

  return (
    <div className="border-b border-gray-200 py-4 px-4 hover:bg-gray-50 transition">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to={`/listing/${listing.id}`}
          className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-200 rounded border border-gray-300 overflow-hidden"
        >
          <img
            src={
              listing.images?.[0]?.url ||
              listing.imageUrl ||
              "https://via.placeholder.com/200x200?text=Listing"
            }
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link
                to={`/listing/${listing.id}`}
                className="text-blue-600 hover:underline font-medium text-sm block mb-1"
              >
                {listing.title}
              </Link>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700 mb-2">
                <span className="font-semibold text-gray-900">
                  GHS {listing.priceGhs.toLocaleString()}
                </span>
                <span>{listing.deliveryLabel}</span>
                <span>{listing.location}</span>
                <span>{conditionLabels[listing.condition]}</span>
                <span>{timeAgo(listing.createdAt)}</span>
              </div>
              {listing.escrowProtected && (
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded mb-2">
                  Escrow Protected
                </span>
              )}
            </div>
          </div>
          {listing.seller && (
            <div className="flex items-center gap-2 mt-2">
              <Link
                to={`/seller/${listing.seller.id}`}
                className="text-xs text-blue-600 hover:underline"
              >
                {listing.seller.pseudonym}
              </Link>
              {listing.seller.sellerProfileStatus === "verified" && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                  Verified
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

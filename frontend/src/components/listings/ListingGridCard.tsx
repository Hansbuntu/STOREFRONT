import { Link } from "react-router-dom";
import { Listing } from "../../types";

interface ListingGridCardProps {
  listing: Listing;
}

export function ListingGridCard({ listing }: ListingGridCardProps) {
  const conditionLabels: Record<string, string> = {
    new: "New",
    like_new: "Like New",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
  };

  return (
    <div className="border border-gray-200 rounded bg-white hover:shadow-md transition">
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="aspect-square bg-gray-200 border-b border-gray-200 overflow-hidden">
          <img
            src={
              listing.images?.[0]?.url ||
              listing.imageUrl ||
              "https://via.placeholder.com/200x200?text=Listing"
            }
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
            {listing.title}
          </h3>
          <div className="text-lg font-semibold text-gray-900 mb-2">
            GHS {listing.priceGhs.toLocaleString()}
          </div>
          <div className="text-xs text-gray-700 space-y-1 mb-2">
            <div>{listing.deliveryLabel}</div>
            <div>{conditionLabels[listing.condition]}</div>
          </div>
          {listing.escrowProtected && (
            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded mb-2">
              Escrow Protected
            </span>
          )}
          {listing.seller && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to={`/seller/${listing.seller.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {listing.seller.pseudonym}
                </Link>
                {listing.seller.sellerProfileStatus === "verified" && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    ✓
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

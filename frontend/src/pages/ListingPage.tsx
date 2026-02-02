import { useParams, Link } from "react-router-dom";

function ListingPage() {
  const { id } = useParams();

  // Later: fetch listing details by id from /listings/:id
  return (
    <div className="space-y-4">
      <Link to="/" className="text-xs">
        ← Back to listings
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="h-64 bg-slate-800 rounded" />
          <h1 className="text-2xl font-semibold">Listing #{id}</h1>
          <p className="text-sm text-slate-300">
            Detailed description of the product or service. Delivery terms and
            any important information from the seller will appear here.
          </p>
        </div>
        <aside className="border border-slate-800 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">Price</p>
            <p className="text-xl font-semibold">GHS 150.00</p>
          </div>
          <button className="w-full bg-brand-600 hover:bg-brand-700 text-sm font-medium py-2 rounded">
            Add to cart
          </button>
          <p className="text-xs text-slate-400">
            Funds are held in escrow by STOREFRONT until you confirm delivery.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default ListingPage;



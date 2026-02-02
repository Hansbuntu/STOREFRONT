import { Link } from "react-router-dom";

function HomePage() {
  // Later: fetch real listings from /listings
  // For now, seed with demo CD stores
  const demoListings = [
    {
      id: 1,
      title: "Highlife Classics CD Bundle",
      store: "Accra Sounds",
      price: 80,
      currency: "GHS",
    },
    {
      id: 2,
      title: "Afrobeats Hits 2025 (2x CD)",
      store: "Kumasi Groove Shop",
      price: 95,
      currency: "GHS",
    },
    {
      id: 3,
      title: "Gospel Favorites Collection",
      store: "Takoradi Praise Records",
      price: 70,
      currency: "GHS",
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold mb-2">
          Anonymous marketplace with escrow
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl">
          STOREFRONT holds funds in custodial escrow until delivery is
          confirmed, protecting buyers while keeping sellers pseudonymous.
        </p>
      </section>
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Featured listings</h2>
          <Link to="/seller" className="text-xs">
            Become a seller
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {demoListings.map((item) => (
            <Link
              key={item.id}
              to={`/listings/${item.id}`}
              className="border border-slate-800 rounded-lg p-4 hover:border-brand-500 transition"
            >
              <div className="h-28 bg-slate-800/80 rounded mb-3" />
              <h3 className="font-medium mb-0.5">{item.title}</h3>
              <p className="text-xs text-slate-400 mb-1">
                {item.store}
              </p>
              <p className="text-sm text-slate-300">
                {item.currency} {item.price.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;



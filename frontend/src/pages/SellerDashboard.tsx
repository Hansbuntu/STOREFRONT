function SellerDashboard() {
  // Later: fetch seller stats, listings, balances from /sellers and /listings
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-xl font-semibold">Seller dashboard</h1>
        <p className="text-sm text-slate-300 max-w-xl">
          Manage your listings, view escrow and available balances, and request
          withdrawals. Your public profile remains pseudonymous; KYC documents
          are encrypted and visible only to admins.
        </p>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-1">Pending escrow</p>
          <p className="text-lg font-semibold">GHS 0.00</p>
        </div>
        <div className="border border-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-1">Available balance</p>
          <p className="text-lg font-semibold">GHS 0.00</p>
        </div>
        <div className="border border-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-1">Platform fee</p>
          <p className="text-lg font-semibold">5%</p>
        </div>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-slate-800 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-medium">Your listings</h2>
          <p className="text-xs text-slate-400">
            Listings management UI will appear here (create/edit listings).
          </p>
        </div>
        <div className="border border-slate-800 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-medium">KYC & payout info</h2>
          <p className="text-xs text-slate-400">
            Verification status, document upload, and payout methods (mobile
            money/bank) will be managed from this panel.
          </p>
        </div>
      </section>
    </div>
  );
}

export default SellerDashboard;



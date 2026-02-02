function DisputesPage() {
  // Later: integrate with /disputes and /orders/:id/dispute
  const demoDisputes = [
    {
      id: 1,
      orderId: 101,
      status: "auto-resolved - refund",
      createdAt: "2026-01-01",
    },
    {
      id: 2,
      orderId: 102,
      status: "awaiting evidence",
      createdAt: "2026-01-05",
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Disputes</h1>
      <p className="text-sm text-slate-300 max-w-2xl">
        Raise disputes on eligible orders, upload structured evidence, and
        track automated resolution outcomes. Only rare edge cases are escalated
        to a human admin for manual review.
      </p>
      <div className="border border-slate-800 rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-medium">Your recent disputes</h2>
        <div className="space-y-2 text-xs">
          {demoDisputes.map((d) => (
            <div
              key={d.id}
              className="flex justify-between items-center border border-slate-800 rounded px-3 py-2"
            >
              <span>
                Order #{d.orderId} • <span className="text-slate-300">{d.status}</span>
              </span>
              <span className="text-slate-500">{d.createdAt}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-slate-800 rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-medium">Open a dispute</h2>
        <p className="text-xs text-slate-400">
          The dispute form will let you pick an order, choose a reason (e.g.
          non-delivery), and upload evidence (photos, receipts, chat logs).
        </p>
      </div>
    </div>
  );
}

export default DisputesPage;



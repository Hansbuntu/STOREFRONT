function CheckoutPage() {
  // Later: call /payments/checkout and redirect to Paystack checkout
  function handleCheckout() {
    // Placeholder for checkout handler
    alert("Checkout flow will redirect to Paystack sandbox.");
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Checkout</h1>
      <p className="text-sm text-slate-300">
        STOREFRONT will hold your payment in escrow. The seller only receives
        funds after you confirm delivery or the auto-release window is reached.
      </p>
      <div className="border border-slate-800 rounded-lg p-4 space-y-3">
        <div>
          <p className="text-xs text-slate-400 mb-1">Order summary</p>
          <p className="text-sm text-slate-200">
            1 item • <span className="font-semibold">GHS 150.00</span>
          </p>
        </div>
        <button
          onClick={handleCheckout}
          className="w-full bg-brand-600 hover:bg-brand-700 text-sm font-medium py-2 rounded"
        >
          Pay securely with Paystack (sandbox)
        </button>
      </div>
    </div>
  );
}

export default CheckoutPage;



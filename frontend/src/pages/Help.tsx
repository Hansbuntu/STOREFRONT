import { Link } from "react-router-dom";
import { Container } from "../components/layout/Container";

export default function Help() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Help & FAQ</h1>
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              How Escrow Works
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">1.</span>
                <span>
                  When you buy an item, your payment is held securely by
                  STOREFRONT in an escrow account. The seller does not receive
                  the funds immediately.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">2.</span>
                <span>
                  The seller ships or delivers your item. You can track the
                  order status in your account.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">3.</span>
                <span>
                  Once you receive and confirm the item, funds are released to
                  the seller. If there's an issue, you can raise a dispute
                  within the confirmation window.
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Buyer Protection
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              STOREFRONT protects buyers by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Holding funds until delivery is confirmed</li>
              <li>Providing a dispute resolution process</li>
              <li>Requiring seller verification for listings</li>
              <li>Maintaining seller ratings and feedback</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Prohibited Items
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              The following items are prohibited on STOREFRONT:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Pirated or unauthorized copies of media (movies, music, software)</li>
              <li>Counterfeit goods</li>
              <li>Illegal items or services</li>
              <li>Items that violate intellectual property rights</li>
            </ul>
            <p className="text-sm text-gray-700 mt-3">
              <strong>Important:</strong> Only list items you own the rights to
              sell. Violations may result in account suspension.
            </p>
            <Link
              to="/report"
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              Report a prohibited listing →
            </Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Seller Verification
            </h2>
            <p className="text-sm text-gray-700">
              To sell on STOREFRONT, you must complete seller verification. This
              includes providing government ID, a selfie, and payout information.
              Your identity remains pseudonymous to buyers, but verification
              helps ensure platform safety.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Contact & Support
            </h2>
            <p className="text-sm text-gray-700">
              For additional support, please use the "Report Listing" feature
              or contact support through your account dashboard.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

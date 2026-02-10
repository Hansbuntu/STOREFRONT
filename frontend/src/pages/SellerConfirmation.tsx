import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container } from "../components/layout/Container";

export default function SellerConfirmation() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-12">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-lg p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Seller profile submitted
          </h1>
          <p className="text-sm text-gray-700">
            Thanks for registering as a seller. Our admin team will review your
            profile and contact you within 2–3 days.
          </p>
          <p className="text-xs text-gray-500">
            Redirecting you to the home screen…
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Go to Home now
          </Link>
        </div>
      </Container>
    </div>
  );
}

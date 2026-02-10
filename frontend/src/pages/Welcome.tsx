import { Link } from "react-router-dom";
import { Container } from "../components/layout/Container";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Container className="py-10 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white border border-gray-200 rounded-lg p-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-3">
          Welcome to STOREFRONT
        </h1>
        <p className="text-sm text-gray-700 mb-6">
          STOREFRONT is a closed marketplace. Please sign in to browse listings
          or create an account to get started.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50"
          >
            Register
          </Link>
        </div>
        <p className="text-xs text-gray-600 mt-6">
          Need help? Visit our{" "}
          <Link to="/help" className="text-blue-600 hover:underline">
            help center
          </Link>
          .
        </p>
        </div>
      </Container>
    </div>
  );
}

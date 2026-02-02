import { Link } from "react-router-dom";

function LoginPage() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Later: POST /auth/login and store JWTs
    alert("Login will call /auth/login and store tokens.");
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Login</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-3 border border-slate-800 rounded-lg p-4"
      >
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Pseudonym or email</label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Password</label>
          <input
            type="password"
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-brand-600 hover:bg-brand-700 text-sm font-medium py-2 rounded"
        >
          Sign in
        </button>
      </form>
      <p className="text-xs text-slate-400">
        No account yet?{" "}
        <Link to="/register" className="underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;



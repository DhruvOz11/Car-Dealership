import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.context";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-asphalt-700 bg-asphalt-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ignition">
            <svg className="h-5 w-5 text-asphalt-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M3 13l1.5-4.5A2 2 0 016.4 7h11.2a2 2 0 011.9 1.5L21 13M5 17a2 2 0 104 0m10 0a2 2 0 10-4 0M3 13h18v3a1 1 0 01-1 1h-1a2 2 0 00-4 0H9a2 2 0 00-4 0H4a1 1 0 01-1-1v-3z"
              />
            </svg>
          </div>
          <span className="font-display text-2xl font-bold uppercase tracking-wide text-chrome-100">
            AutoVault
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span
                className={`plate ${user.role === "ADMIN" ? "!bg-ignition !text-asphalt-900 !border-ignition" : ""} hidden sm:inline-flex`}
              >
                {user.role}
              </span>
              <span className="hidden text-sm text-chrome-500 md:block">{user.email}</span>
              {user.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="focus-ring rounded-md bg-asphalt-700 px-3 py-2 text-sm font-semibold text-chrome-100 transition hover:bg-asphalt-600"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/"
                className="focus-ring hidden rounded-md px-3 py-2 text-sm font-medium text-chrome-500 transition hover:text-chrome-100 sm:block"
              >
                Inventory
              </Link>
              <button
                onClick={handleLogout}
                className="focus-ring rounded-md border border-asphalt-600 px-3 py-2 text-sm font-semibold text-chrome-300 transition hover:border-ignition hover:text-ignition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-chrome-300 hover:text-chrome-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="focus-ring rounded-md bg-ignition px-4 py-2 text-sm font-semibold text-asphalt-900 transition hover:bg-ignition-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

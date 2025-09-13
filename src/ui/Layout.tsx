import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../store/auth";

interface NavLinkProps {
  to: string;
  label: string;
}

const NavLink = ({ to, label }: NavLinkProps) => {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      className={`px-1 py-2 text-[13px] font-medium tracking-[-0.01em] underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 rounded ${
        active
          ? "text-black underline decoration-2"
          : "text-gray-700 hover:text-black hover:underline"
      }`}
    >
      {label}
    </Link>
  );
};

export const Layout = () => {
  const navigate = useNavigate();
  const { user, token, clearAuth } = useAuthStore();

  return (
    <div className="relative min-h-screen flex flex-col bg-white text-black">
      {/* background illustration */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gray-50 bg-top bg-no-repeat bg-[length:900px_900px] opacity-60"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,\
<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1200\" height=\"900\" viewBox=\"0 0 1200 900\">\
  <defs>\
    <linearGradient id=\"g\" x1=\"0\" x2=\"1\">\
      <stop offset=\"0\" stop-color=\"%23e5e7eb\"/>\
      <stop offset=\"1\" stop-color=\"%23f3f4f6\"/>\
    </linearGradient>\
  </defs>\
  <rect width=\"1200\" height=\"900\" fill=\"url(%23g)\"/>\
  <g fill=\"none\" stroke=\"%23d1d5db\" stroke-width=\"1.5\" opacity=\"0.6\">\
    <path d=\"M80 140 C220 60, 360 60, 520 140 S840 220, 1080 140\"/>\
    <path d=\"M60 360 C260 300, 420 420, 620 360 S940 300, 1140 360\"/>\
    <path d=\"M100 600 C280 520, 380 700, 560 620 S900 540, 1100 620\"/>\
  </g>\
  <g fill=\"%23d1d5db\" opacity=\"0.8\">\
    <circle cx=\"180\" cy=\"140\" r=\"4\"/>\
    <circle cx=\"520\" cy=\"140\" r=\"4\"/>\
    <circle cx=\"860\" cy=\"200\" r=\"4\"/>\
    <circle cx=\"300\" cy=\"360\" r=\"4\"/>\
    <circle cx=\"760\" cy=\"340\" r=\"4\"/>\
    <circle cx=\"1040\" cy=\"360\" r=\"4\"/>\
    <circle cx=\"240\" cy=\"600\" r=\"4\"/>\
    <circle cx=\"560\" cy=\"620\" r=\"4\"/>\
    <circle cx=\"920\" cy=\"600\" r=\"4\"/>\
  </g>\
</svg>')",
        }}
      />
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-4">
          <a href="/dashboard" className="flex items-center gap-2 select-none">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-black text-white">
              {/* Logo mark: route pin with S curve */}
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
                <path d="M9 10c0-1.657 3-1.657 3-3s-3-1.343-3-3" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Sanchara Admin</span>
          </a>
          {token ? (
            <nav className="hidden md:flex gap-5 ml-2">
              <NavLink to="/dashboard" label="Dashboard" />
              <NavLink to="/users" label="Users" />
              {/* Guests removed from navbar */}
              <NavLink to="/analytics" label="Analytics" />
              {user?.role === "SUPER_ADMIN" ? (
                <NavLink to="/create" label="Create Admin" />
              ) : null}
            </nav>
          ) : null}
          <div className="ml-auto flex items-center gap-3">
            {token ? (
              <>
                <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col leading-tight select-text">
                  <span className="text-[12px] font-medium text-gray-900">{user?.email}</span>
                  <span className="text-[11px] text-gray-500">{user?.role}</span>
                </div>
                <button
                  onClick={() => { clearAuth(); navigate("/signin"); }}
                  aria-label="Logout"
                  className="p-2 rounded-md text-black hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <div className="font-semibold text-gray-800">Sanchara Admin</div>
            <div className="mt-2">Secure admin for Sanchara platform.</div>
          </div>
          <div>
      
          </div>
          <div className="sm:text-right">
            <div className="font-semibold text-gray-800">Status</div>
            <div className="mt-2 inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" aria-hidden />
              <span className="text-gray-700">All systems operational</span>
            </div>
            <div className="mt-2">© {new Date().getFullYear()} Sanchara</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
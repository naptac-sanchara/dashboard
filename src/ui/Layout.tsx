import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Users,
  BarChart3,
  UserPlus
} from "lucide-react";
import { useAuthStore } from "../store/auth";
import { useState } from "react";

interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const SidebarLink = ({ to, label, icon }: NavLinkProps) => {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${
        active
          ? "bg-gray-100 text-black border border-gray-300"
          : "text-gray-700 hover:bg-gray-100 hover:text-black border border-transparent"
      }`}
    >
      <span className={`flex-shrink-0 transition-colors ${
        active ? "text-black" : "text-gray-400 group-hover:text-gray-600"
      }`}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
};

export const Layout = () => {
  const navigate = useNavigate();
  const { user, token, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(true);

  const sidebarLinks = [
    { to: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { to: "/users", label: "Users", icon: <Users className="h-5 w-5" /> },
    { to: "/analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    clearAuth();
    localStorage.removeItem("dashboardMetrics");
    navigate("/signin");
  };

  return (
    <div className="relative min-h-screen flex bg-white text-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-300 shadow-lg transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="h-[64px] px-4 flex items-center border-b border-gray-300">
            <img 
              src="/logo.png" 
              alt="Sanchara" 
              className="h-10 w-auto object-contain" 
            />
            <button
              className="ml-auto md:hidden p-1.5 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            <div className="mb-4">
              <div className="px-3 text-xs uppercase text-gray-500 tracking-wider font-semibold mb-3">
                Navigation
              </div>
              {sidebarLinks.map((l) => (
                <SidebarLink 
                  key={l.to} 
                  to={l.to} 
                  label={l.label} 
                  icon={l.icon}
                />
              ))}
            </div>

            {user?.role === "SUPER_ADMIN" && (
              <div className="mb-4">
                <div className="px-3 text-xs uppercase text-gray-500 tracking-wider font-semibold mb-3">
                  Administration
                </div>
                <SidebarLink 
                  to="/create" 
                  label="Create Admin" 
                  icon={<UserPlus className="h-5 w-5" />}
                />
              </div>
            )}
          </nav>

          {/* Account */}
          <div className="border-t border-gray-300 bg-gray-50">
            <div className="px-3 py-4">
              <div className="px-3 text-xs uppercase text-gray-500 tracking-wider font-semibold mb-3">
                Account
              </div>
              {token && (
                <>
                  <div className="mb-3 px-3 flex items-center gap-3 p-2 rounded-lg bg-white border border-gray-300">
                    <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{user?.email}</div>
                      <div className="text-xs text-gray-500 truncate capitalize">{user?.role?.toLowerCase()}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-all duration-200 border border-transparent hover:border-gray-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-300 hidden md:block bg-white">
            <div className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} Sanchara Admin
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar Toggle Button */}
      <button
        aria-label={open ? "Close sidebar" : "Open sidebar"}
        onClick={() => setOpen((s) => !s)}
        className="fixed z-60 p-2 rounded-full bg-white border border-gray-300 shadow-lg hover:shadow-xl focus:outline-none flex items-center justify-center transition-all duration-200 hover:bg-gray-100"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          left: open ? "16rem" : "0.5rem",
        }}
      >
        {open ? <ChevronLeft className="h-4 w-4 text-gray-600" /> : <ChevronRight className="h-4 w-4 text-gray-600" />}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${
          open ? "md:ml-64" : "md:ml-0"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-300 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 h-[64px] shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-colors"
                onClick={() => setOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Sanchara Admin</h1>
            </div>
            {token && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col text-right">
                  <div className="text-sm font-medium text-gray-900 truncate">{user?.email}</div>
                  <div className="text-xs text-gray-500 truncate capitalize">{user?.role?.toLowerCase()}</div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Footer */}
        <footer className="mt-auto border-t border-gray-300 bg-white md:hidden">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-800">Sanchara Admin</div>
              <div className="text-gray-500">© {new Date().getFullYear()}</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const NavLink = ({ to, label }: { to: string; label: string }) => {
	const loc = useLocation();
	const active = loc.pathname === to;
	return (
		<Link
			to={to}
			style={{
				padding: "8px 12px",
				textDecoration: "none",
				color: active ? "#000" : "#222",
				borderBottom: active ? "2px solid #000" : "2px solid transparent",
			}}
		>
			{label}
		</Link>
	);
};

export const Layout = () => {
	const navigate = useNavigate();
	const { user, token, clearAuth } = useAuthStore();

	return (
		<div style={{ color: "#000", background: "#fff", minHeight: "100vh" }}>
			<header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottom: "2px solid #000" }}>
				<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
					<div style={{ fontWeight: 800, letterSpacing: 0.3 }} className="underline-link">Sanchara Admin</div>
					{token ? (
						<nav style={{ display: "flex", gap: 8 }}>
							<NavLink to="/dashboard" label="Dashboard" />
							<NavLink to="/create" label="Create Admin" />
						</nav>
					) : null}
				</div>
				<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
					{token ? (
						<>
							<div style={{ fontSize: 12, color: "#222" }}>{user?.email} · {user?.role}</div>
							<button
								style={{ background: "#000", color: "#fff", border: "1px solid #000", padding: "6px 10px", cursor: "pointer" }}
								onClick={() => { clearAuth(); navigate("/signin"); }}
							>
								Logout
							</button>
						</>
					) : null}
				</div>
			</header>
			<main style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
				<Outlet />
			</main>
			<footer style={{ borderTop: "1px solid #000", padding: 16, textAlign: "center", color: "#222" }}>
				© {new Date().getFullYear()} Sanchara
			</footer>
		</div>
	);
};



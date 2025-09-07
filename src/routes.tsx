import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { Layout } from "./ui/Layout";
import { AdminSignin } from "./views/AdminSignin";
import { CreateAdmin } from "./views/CreateAdmin";
import { Dashboard } from "./views/Dashboard";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
	const token = useAuthStore(s => s.token);
	if (!token) return <Navigate to="/signin" replace />;
	return children;
};

const RequireGuest = ({ children }: { children: JSX.Element }) => {
	const token = useAuthStore(s => s.token);
	if (token) return <Navigate to="/dashboard" replace />;
	return children;
};

const RequireSuperAdmin = ({ children }: { children: JSX.Element }) => {
	const user = useAuthStore(s => s.user);
	if (!user) return <Navigate to="/signin" replace />;
	if (user.role !== "SUPER_ADMIN") return <Navigate to="/dashboard" replace />;
	return children;
};

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{ index: true, element: <Navigate to="/dashboard" replace /> },
			{ path: "signin", element: <RequireGuest><AdminSignin /></RequireGuest> },
			{ path: "create", element: <RequireSuperAdmin><CreateAdmin /></RequireSuperAdmin> },
			{ path: "dashboard", element: <RequireAuth><Dashboard /></RequireAuth> },
		],
	},
]);



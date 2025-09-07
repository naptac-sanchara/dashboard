import { useState } from "react";
import { AdminApi } from "../lib/api";
import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";

export const AdminSignin = () => {
	const setAuth = useAuthStore(s => s.setAuth);
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const res = await AdminApi.signin({ email, password });
			setAuth(res.data.user, res.data.token);
			navigate("/dashboard");
		} catch (err: any) {
			setError(err?.response?.data?.message || "Failed to sign in.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="card" style={{ maxWidth: 420, margin: "48px auto" }}>
			<h1 className="title">Welcome back</h1>
			<p className="subtitle">Sign in to access the admin dashboard.</p>
			<form onSubmit={onSubmit} className="stack">
				<input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
				<input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
				<button className="btn" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
			</form>
			{error ? <div style={{ color: "#c00", marginTop: 12 }}>{error}</div> : null}
		</section>
	);
};



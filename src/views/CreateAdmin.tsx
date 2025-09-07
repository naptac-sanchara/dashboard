import { useState } from "react";
import { AdminApi } from "../lib/api";

export const CreateAdmin = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		setLoading(true);
		try {
			await AdminApi.createAdmin({ email, password });
			setSuccess("Admin created.");
			setEmail("");
			setPassword("");
		} catch (err: any) {
			setError(err?.response?.data?.message || "Failed to create admin.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="card" style={{ maxWidth: 540, margin: "32px auto" }}>
			<h1 className="title">Create Admin</h1>
			<p className="subtitle">Only SUPER_ADMIN users can create new admins.</p>
			<form onSubmit={onSubmit} className="stack">
				<input className="input" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} />
				<input className="input" placeholder="Temporary password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
				<div className="row">
					<button className="btn" disabled={loading}>{loading ? "Creating..." : "Create Admin"}</button>
					{success ? <span className="muted">{success}</span> : null}
				</div>
			</form>
			{error ? <div style={{ color: "#c00", marginTop: 12 }}>{error}</div> : null}
		</section>
	);
};



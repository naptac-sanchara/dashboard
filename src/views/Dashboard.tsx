import { useEffect, useState } from "react";
import { AdminApi } from "../lib/api";

export const Dashboard = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [metrics, setMetrics] = useState<Record<string, unknown>>({});

	useEffect(() => {
		let mounted = true;
		AdminApi.dashboard()
			.then((res) => {
				if (!mounted) return;
				setMetrics(res.data.metrics || {});
			})
			.catch((err: any) => {
				setError(err?.response?.data?.message || "Failed to load dashboard.");
			})
			.finally(() => setLoading(false));
		return () => { mounted = false; };
	}, []);

	return (
		<section>
			<h1 className="title">Dashboard</h1>
			{loading ? <div>Loading...</div> : null}
			{error ? <div style={{ color: "#c00" }}>{error}</div> : null}
			{!loading && !error ? (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
					{Object.keys(metrics).length === 0 ? (
						<div className="card">No metrics yet.</div>
					) : (
						Object.entries(metrics).map(([key, value]) => (
							<div key={key} className="card">
								<div className="muted" style={{ fontSize: 12 }}>{key}</div>
								{value !== null && typeof value === 'object' ? (
									<pre style={{ margin: '8px 0 0', padding: 12, border: '1px solid #000', background: '#fff', overflowX: 'auto', fontSize: 12 }}>
										{JSON.stringify(value, null, 2)}
									</pre>
								) : (
									<div style={{ fontSize: 22 }}>{String(value)}</div>
								)}
							</div>
						))
					)}
				</div>
			) : null}
		</section>
	);
};



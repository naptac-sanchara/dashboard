import { useEffect, useMemo, useState } from "react";
import { AdminApi } from "../lib/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

type GuestsPoint = { time: string; count: number };
type HeatPoint = { latitude: number; longitude: number; weight: number };
type PermissionRow = { permission: string; status: string; count: number };

const CACHE_KEY = "analytics_cache_v1";

const toKm = (meters: number) => (meters / 1000).toFixed(2);

const Sparkline = ({ points }: { points: GuestsPoint[] }) => {
  if (!points || points.length === 0) return <div className="text-sm text-gray-500">No data</div>;
  const labels = points.map((p) => new Date(p.time).toLocaleDateString());
  const data = {
    labels,
    datasets: [
      {
        label: "Visits",
        data: points.map((p) => p.count),
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14,165,233,0.12)",
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };
  return <Line data={data} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false } } }} />;
};

const PermissionBars = ({ rows }: { rows: PermissionRow[] }) => {
  if (!rows || rows.length === 0) return <div className="text-sm text-gray-500">No permissions data</div>;
  const grouped: Record<string, { granted: number; denied: number }> = {};
  rows.forEach((r) => {
    const key = r.permission ?? "UNKNOWN";
    grouped[key] ??= { granted: 0, denied: 0 };
    if ((r.status ?? "").toLowerCase() === "granted") grouped[key].granted += Number(r.count ?? 0);
    else grouped[key].denied += Number(r.count ?? 0);
  });

  const labels = Object.keys(grouped);
  const granted = labels.map((l) => grouped[l].granted);
  const denied = labels.map((l) => grouped[l].denied);

  const data = {
    labels,
    datasets: [
      { label: "Granted", data: granted, backgroundColor: "#10b981" },
      { label: "Denied", data: denied, backgroundColor: "#ef4444" },
    ],
  };

  return <Bar data={data} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />;
};

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [overviewRaw, setOverviewRaw] = useState<any | null>(null);
  const [permissionsRaw, setPermissionsRaw] = useState<any[] | null>(null);
  const [guestsRaw, setGuestsRaw] = useState<any[] | null>(null);
  const [heatRaw, setHeatRaw] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const readCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const writeCache = (payload: any) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, fetchedAt: Date.now() }));
    } catch {}
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {}
  };

  const load = async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      if (!force) {
        const cached = readCache();
        if (cached) {
          setOverviewRaw(cached.overviewRaw ?? cached.overview);
          setPermissionsRaw(cached.permissionsRaw ?? cached.permissions);
          setGuestsRaw(cached.guestsRaw ?? cached.guests);
          setHeatRaw(cached.heatRaw ?? cached.heat);
          setLoading(false);
          return;
        }
      }

      const [ov, perm, ts, hm] = await Promise.all([
        AdminApi.analyticsOverview(),
        AdminApi.permissionsStats(),
        AdminApi.guestsTimeSeries({ interval: "day" }),
        AdminApi.heatmap(),
      ]);

      const normOverview = (ov as any)?.data?.data ?? (ov as any)?.data ?? ov;
      const normPerm = (perm as any)?.data?.data ?? (perm as any)?.data ?? perm?.data ?? perm;
      const normGuests = (ts as any)?.data ?? (ts as any)?.data ?? ts;
      const normHeat = (hm as any)?.data ?? hm;

      setOverviewRaw(normOverview);
      setPermissionsRaw(normPerm);
      setGuestsRaw(normGuests);
      setHeatRaw(normHeat);

      // heavy cache until manual refresh
      writeCache({ overviewRaw: normOverview, permissionsRaw: normPerm, guestsRaw: normGuests, heatRaw: normHeat });
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    clearCache();
    await load(true);
    setRefreshing(false);
  };

  // derive shapes
  const overview = useMemo(() => {
    if (!overviewRaw) return null;
    const averages = overviewRaw?.averages ?? overviewRaw?.data?.averages ?? {};
    const timeseries = overviewRaw?.timeseries ?? overviewRaw?.data?.timeseries ?? {};
    return {
      distanceMeters: averages?.distanceMeters ?? null,
      durationSeconds: averages?.durationSeconds ?? null,
      timeseriesTrips: timeseries?.trips ?? [],
      timeseriesActive: timeseries?.activeUsers ?? [],
    };
  }, [overviewRaw]);

  const permissions = useMemo<PermissionRow[]>(() => {
    if (!permissionsRaw) return [];
    return (permissionsRaw as any[]).map((r) => ({
      permission: r.permission ?? r.type ?? "UNKNOWN",
      status: r.status ?? r.state ?? "unknown",
      count: Number(r.count ?? 0),
    }));
  }, [permissionsRaw]);

  const guestsTS = useMemo<GuestsPoint[]>(() => {
    if (!guestsRaw) return [];
    return (guestsRaw as any[]).map((it) => {
      if ("day" in it) return { time: it.day, count: Number(it.visits ?? it.count ?? 0) };
      if ("time" in it) return { time: it.time, count: Number(it.count ?? 0) };
      if ("date" in it) return { time: it.date, count: Number(it.count ?? 0) };
      return { time: String(it.time ?? it.day ?? ""), count: Number(it.visits ?? it.count ?? 0) };
    });
  }, [guestsRaw]);

  const heatmap = useMemo<HeatPoint[]>(() => {
    if (!heatRaw) return [];
    return (heatRaw as any[]).map((h) => ({
      latitude: Number(h.lat ?? h.latitude ?? 0),
      longitude: Number(h.lng ?? h.longitude ?? 0),
      weight: Number(h.count ?? h.weight ?? 0),
    }));
  }, [heatRaw]);

  const totalTripsFromSeries = useMemo(() => guestsTS.reduce((s, p) => s + p.count, 0), [guestsTS]);
  const avgDistanceKm = overview?.distanceMeters ? toKm(overview.distanceMeters) : "-";
  const avgDurationMin = overview?.durationSeconds ? Math.round(overview.durationSeconds / 60) : "-";

  // Chart data for big line
  const lineData = useMemo(() => {
    const pts = guestsTS;
    const labels = pts.map((p) => new Date(p.time).toLocaleDateString());
    return {
      labels,
      datasets: [
        {
          label: "Guest visits",
          data: pts.map((p) => p.count),
          borderColor: "#0284c7",
          backgroundColor: "rgba(2,132,199,0.12)",
          tension: 0.25,
          fill: true,
        },
      ],
    };
  }, [guestsTS]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="px-3 py-2 border rounded-md text-sm" disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-700 bg-red-50 border border-red-200 rounded-md p-3 text-sm">{error}</div>}

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-white border rounded-xl animate-pulse h-28" />
            ))}
          </div>
          <div className="p-4 bg-white border rounded-xl animate-pulse h-64" />
          <div className="p-4 bg-white border rounded-xl animate-pulse h-36" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-600">Avg Distance (km)</div>
              <div className="text-2xl font-bold">{avgDistanceKm}</div>
              <div className="text-sm text-gray-500 mt-1">Avg duration: {avgDurationMin} min</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-600">Guest visits (sample)</div>
              <div className="text-2xl font-bold">{totalTripsFromSeries}</div>
              <div className="mt-2">
                <Sparkline points={guestsTS.slice(-30)} />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-600">Heatmap points</div>
              <div className="text-2xl font-bold">{heatmap.length}</div>
              <div className="text-sm text-gray-500 mt-1">Top sample locations</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">Guest visits (time series)</div>
                <div className="text-sm text-gray-500">Last {Math.min(guestsTS.length, 60)} points</div>
              </div>
              <div className="mb-3">
                <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                {(guestsTS.slice(-6).reverse() || []).map((p) => (
                  <div key={p.time} className="flex justify-between border-t py-2">
                    <div>{new Date(p.time).toLocaleDateString()}</div>
                    <div className="font-medium">{p.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="font-medium mb-2">Permissions</div>
              <PermissionBars rows={permissions} />
            </div>
          </div>

            <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="font-medium mb-2">Heatmap Points Visualization</div>
              {heatmap.length === 0 ? (
              <div className="text-sm text-gray-500">No heatmap data</div>
              ) : (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-xs">
                <Pie
                  data={{
                  labels: heatmap.slice(0, 10).map(
                    (h) => `${h.latitude.toFixed(3)}, ${h.longitude.toFixed(3)}`
                  ),
                  datasets: [
                    {
                    label: "Visit Count",
                    data: heatmap.slice(0, 10).map((h) => h.weight),
                    backgroundColor: [
                      "#f59e42",
                      "#fbbf24",
                      "#f87171",
                      "#60a5fa",
                      "#34d399",
                      "#a78bfa",
                      "#f472b6",
                      "#38bdf8",
                      "#facc15",
                      "#4ade80",
                    ],
                    },
                  ],
                  }}
                  options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                    title: { display: false },
                  },
                  }}
                />
                </div>
                <div className="text-xs text-gray-500 mt-2">
                Top 10 locations by visit count
                </div>
              </div>
              )}
            </div>
        </>
      )}
    </section>
  );
};

export default Analytics;
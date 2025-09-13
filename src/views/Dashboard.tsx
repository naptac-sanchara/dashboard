import { memo, useEffect, useMemo, useState } from "react";
import { AdminApi } from "../lib/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  User,
  Shield,
  UserRoundPlus,
  Mail,
  Smartphone,
  LogIn,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

interface MetricCardProps {
  label: string;
  value: unknown;
}

const MetricCard = memo(({ label, value }: MetricCardProps) => {
  const chart = useMemo(() => buildChartConfig(label, value), [label, value]);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-700 capitalize">
          {label}
        </div>
      </div>
      {chart ? (
        <div className="mt-2" style={{ height: 160 }}>
          {chart.type === "line" ? (
            <Line options={chart.options} data={chart.data} />
          ) : chart.type === "bar" ? (
            <Bar options={chart.options} data={chart.data} />
          ) : (
            <Doughnut options={chart.options} data={chart.data} />
          )}
        </div>
      ) : (
        <div className="text-2xl font-bold mt-1">{String(value)}</div>
      )}
    </div>
  );
});

type ChartType = "line" | "bar" | "doughnut";
type ChartConfig = { type: ChartType; data: any; options: any } | null;

function isRecordOfNumbers(obj: unknown): obj is Record<string, number> {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  return Object.values(obj as Record<string, unknown>).every(
    (v) => typeof v === "number"
  );
}

function isArrayOfNumbers(val: unknown): val is number[] {
  return Array.isArray(val) && val.length > 0 && val.every((v) => typeof v === "number");
}

type LabeledValue = { label?: string; name?: string; title?: string; value: number };
function isArrayOfLabeledValues(val: unknown): val is LabeledValue[] {
  return Array.isArray(val) && val.length > 0 && val.every((v) =>
    typeof v === "object" && v !== null && typeof (v as any).value === "number"
  );
}

function buildChartConfig(label: string, value: unknown): ChartConfig {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { ticks: { color: "#444" }, grid: { display: false } },
      y: { ticks: { color: "#444" }, grid: { color: "#eee" } },
    },
  };

  if (isRecordOfNumbers(value)) {
    return {
      type: "bar",
      data: {
        labels: Object.keys(value),
        datasets: [
          {
            label,
            data: Object.values(value),
            backgroundColor: "rgba(0,0,0,0.85)",
            borderRadius: 6,
          },
        ],
      },
      options: baseOptions,
    };
  }

  if (isArrayOfNumbers(value)) {
    return {
      type: "line",
      data: {
        labels: (value as number[]).map((_, i) => String(i + 1)),
        datasets: [
          {
            label,
            data: value as number[],
            fill: true,
            borderColor: "#000",
            backgroundColor: "rgba(0,0,0,0.08)",
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      },
      options: baseOptions,
    };
  }

  if (isArrayOfLabeledValues(value)) {
    const arr = value as LabeledValue[];
    const labels = arr.map((v) => v.label || v.name || v.title || "");
    const dataValues = arr.map((v) => v.value);
    const colors = labels.map((_, i) => `hsl(${(i * 48) % 360} 60% 35% / 0.9)`);

    if (labels.length <= 6) {
      return {
        type: "doughnut",
        data: {
          labels,
          datasets: [{ label, data: dataValues, backgroundColor: colors, borderWidth: 0 }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
      };
    }

    return {
      type: "bar",
      data: { labels, datasets: [{ label, data: dataValues, backgroundColor: colors }] },
      options: baseOptions,
    };
  }

  return null;
}

type RecentMetric = Record<string, unknown[]>;
function isRecentMetric(val: unknown): val is RecentMetric {
  if (!val || typeof val !== "object" || Array.isArray(val)) return false;
  return Object.values(val as Record<string, unknown>).every((v) => Array.isArray(v));
}

function formatTs(ts?: string) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

const RecentCard = memo(({ value }: { value: RecentMetric }) => {
  const entries = Object.entries(value);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Recent activity</div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        {entries.map(([section, items]) => (
          <div
            key={section}
            className="rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-200 bg-gray-50">
              <SectionIcon name={section} />
              <div className="text-sm font-medium capitalize">{section}</div>
            </div>
            {Array.isArray(items) && items.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {items.slice(0, 5).map((it: any) => (
                  <li
                    key={it.id || it.email || Math.random()}
                    className="px-3 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <RowIcon section={section} />
                      <span className="text-sm text-gray-900 truncate">
                        {it.email || it.platform || it.id}
                        {it.role && (
                          <span className="text-gray-600"> · {it.role}</span>
                        )}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {formatTs(it.createdAt || it.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-3 text-xs text-gray-500">
                No recent items
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

const SectionIcon = ({ name }: { name: string }) => {
  const n = name.toLowerCase();
  if (n.includes("admin")) return <Shield className="h-4 w-4 text-amber-600" />;
  if (n.includes("visit")) return <Smartphone className="h-4 w-4 text-emerald-600" />;
  return <User className="h-4 w-4 text-emerald-600" />;
};

const RowIcon = ({ section }: { section: string }) => {
  const s = section.toLowerCase();
  if (s.includes("admin")) return <UserRoundPlus className="h-4 w-4 text-amber-600" />;
  if (s.includes("visit")) return <LogIn className="h-4 w-4 text-emerald-600" />;
  return <Mail className="h-4 w-4 text-emerald-600" />;
};

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Record<string, unknown>>({});

  const entries = useMemo(() => Object.entries(metrics), [metrics]);

  useEffect(() => {
    let mounted = true;

    // Try cache first
    const cached = localStorage.getItem("dashboardMetrics");
    if (cached) {
      setMetrics(JSON.parse(cached));
      setLoading(false);
    }

    // Always fetch fresh data (cache will update)
    AdminApi.dashboard()
      .then((res) => {
        if (!mounted) return;
        setMetrics(res.data.metrics || {});
        localStorage.setItem(
          "dashboardMetrics",
          JSON.stringify(res.data.metrics || {})
        );
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message || "Failed to load dashboard.");
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {error && (
        <div className="mb-4 text-red-700 bg-red-50 border border-red-200 rounded-md p-4 text-sm shadow-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 p-4 bg-white shadow"
                       >
              <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
              <div className="h-40 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
<iframe
  title="Sanchara_Dashboard"
  width="1140"
  height="541.25"
  src="https://app.powerbi.com/reportEmbed?reportId=ecfa2593-4a6d-4344-9f55-14e9da2c80cb&autoAuth=true&ctid=57f28137-86e8-4b16-b8c0-0450878e29b0"
  frameBorder={0}
  allowFullScreen
></iframe>
        </div>
      )}
    </section>
  );
};

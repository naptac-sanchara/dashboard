import { useState } from "react";
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




export const Dashboard = () => {
  const [loading,setLoading] = useState(true);
  const [error,] = useState<string | null>(null);


  setTimeout(() => {
    setLoading(false);
  }, 1000);

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

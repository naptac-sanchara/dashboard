import { useEffect, useRef, useState } from "react";
import { AdminApi } from "../lib/api";

type Visit = {
  visitId: string | number;
  ipAddress: string;
  visitTime: string;
  platform?: string;
  userAgent?: string;
};

const CACHE_KEY = "guests_cache_v1";

export default function Guests() {
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<Visit[] | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const initialFetchedRef = useRef(false);
  const fetchingRef = useRef(false);
  const debounceRef = useRef<number | null>(null);

  const normalize = (res: any) => {
    const body = res?.data ?? res;
    const data = body?.data ?? body;
    const items = data?.items ?? [];
    const totalCount = Number(data?.total ?? data?.totalCount ?? 0) || 0;
    const mapped: Visit[] = (items || []).map((it: any) => ({
      visitId: it.id ?? it.visitId ?? it._id ?? "",
      ipAddress: it.ip_address ?? it.ipAddress ?? it.ip ?? "-",
      visitTime: it.created_at ?? it.createdAt ?? it.visitTime ?? "",
      platform: it.platform,
      userAgent: it.user_agent ?? it.userAgent,
    }));
    return { items: mapped, total: totalCount, page: Number(data?.page ?? page) || page };
  };

  const readCache = (p: number) => {
    try {
      const raw = localStorage.getItem(`${CACHE_KEY}_page_${p}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const writeCache = (p: number, payload: any) => {
    try {
      localStorage.setItem(`${CACHE_KEY}_page_${p}`, JSON.stringify(payload));
    } catch {}
  };

  const clearCache = () => {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(CACHE_KEY)) localStorage.removeItem(k);
      });
    } catch {}
  };

  const fetchPage = async (p = 1, force = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      if (!force) {
        const cached = readCache(p);
        if (cached) {
          setVisits(cached.items);
          setTotal(cached.total);
          setPage(p);
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
      }

      const res: any = await AdminApi.listGuests(p, limit);
      const { items, total: totalCount } = normalize(res);
      setVisits(items);
      setTotal(totalCount);
      setPage(p);
      writeCache(p, { items, total: totalCount, page: p, fetchedAt: Date.now() });
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to load guest visits.");
      setVisits([]);
      setTotal(0);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (initialFetchedRef.current) return;
    initialFetchedRef.current = true;
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = (visits ?? []).filter((v) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (String(v.ipAddress ?? "")).toLowerCase().includes(q) || String(v.visitId).toLowerCase().includes(q);
  });

  const onSearchChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if ((!visits || visits.length === 0) && value.trim()) {
        fetchPage(1, true);
      }
    }, 250);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    clearCache();
    await fetchPage(page, true);
    setRefreshing(false);
  };

  const list = filtered;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Guest Visits</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search ip / id..."
              className="px-3 py-2 border rounded-md w-64 text-sm"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-1 top-1.5 text-gray-500 text-xs">Clear</button>
            )}
          </div>
          <button onClick={onRefresh} disabled={refreshing} className="px-3 py-2 border rounded-md text-sm">
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-700 bg-red-50 border border-red-200 rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/6 ml-auto" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <ul className="divide-y">
              {list.map((v) => (
                <li key={String(v.visitId)} className="py-2 flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div>
                    <div className="font-medium">{v.ipAddress}</div>
                    <div className="text-sm text-gray-600">{String(v.visitId)}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {v.visitTime ? new Date(v.visitTime).toLocaleString() : "-"}
                  </div>
                </li>
              ))}
            </ul>

            {list.length === 0 && !loading && (
              <div className="text-sm text-gray-500 py-3">No guest visits found.</div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Total: {total}</div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 border rounded"
                  disabled={page <= 1}
                  onClick={() => fetchPage(page - 1)}
                >
                  Prev
                </button>
                <span className="text-sm">Page {page} / {totalPages}</span>
                <button
                  className="px-3 py-1 border rounded"
                  disabled={page >= totalPages}
                  onClick={() => fetchPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
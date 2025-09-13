import { useEffect, useRef, useState } from "react";
import { AdminApi } from "../lib/api";

type UserItem = {
  userId: string;
  email: string;
  username?: string;
  isVerified?: boolean;
  firstName?: string;
  lastName?: string;
  createdAt: string;
};

const CACHE_KEY = "users_cache_v1";

/* helper: deterministic color from string */
const colorFrom = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  const c = (h & 0x00ffffff).toString(16).toUpperCase();
  return `#${"00000".substring(0, 6 - c.length)}${c}`;
};

const initialsOf = (u?: UserItem) => {
  if (!u) return "?";
  if (u.username) {
    return u.username.slice(0, 2).toUpperCase();
  }
  const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  if (name) {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return (u.email ?? "?").slice(0, 2).toUpperCase();
};

export default function Users() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserItem[] | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const initialFetchedRef = useRef(false);
  const fetchingRef = useRef(false);
  const debounceRef = useRef<number | null>(null);

  const normalizeResponse = (res: any) => {
    const body = res?.data ?? res;
    const items = body?.data?.items ?? body?.items ?? body?.data?.users ?? [];
    const totalCount =
      Number(body?.data?.total ?? body?.total ?? body?.data?.totalCount ?? body?.totalCount ?? 0) || 0;

    const mapped: UserItem[] = (items || []).map((it: any) => ({
      userId: it.id ?? it.userId ?? it._id ?? "",
      email: it.email ?? it.username ?? "",
      username: it.username ?? (it.email ? String(it.email).split("@")[0] : undefined),
      isVerified: it.isVerified ?? it.verified ?? false,
      firstName: it.firstName ?? undefined,
      lastName: it.lastName ?? undefined,
      createdAt: it.createdAt ?? it.created_at ?? "",
    }));

    return { items: mapped, total: totalCount, page: Number(body?.data?.page ?? body?.page ?? page) || page };
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
          setUsers(cached.items);
          setTotal(cached.total);
          setPage(p);
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
      }

      const res: any = await AdminApi.listUsers(p, limit);
      const { items, total: totalCount } = normalizeResponse(res);
      setUsers(items);
      setTotal(totalCount);
      setPage(p);
      writeCache(p, { items, total: totalCount, page: p, fetchedAt: Date.now() });
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to load users.");
      setUsers([]);
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

  // client-side search with small debounce
  const filtered = (users ?? []).filter((u) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.username ?? "").toLowerCase().includes(q) ||
      (u.userId ?? "").toLowerCase().includes(q)
    );
  });

  const onSearchChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if ((!users || users.length === 0) && value.trim()) {
        fetchPage(1, true);
      }
    }, 200);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    clearCache();
    await fetchPage(page, true);
    setRefreshing(false);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const list = filtered;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform users — cached for speed. Click Refresh for latest data.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search email / username / id..."
              className="px-3 py-2 border rounded-md w-72 text-sm focus:ring-1 focus:ring-sky-300"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-1 top-1.5 text-gray-500 text-xs">Clear</button>
            )}
          </div>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="px-3 py-2 bg-white border rounded-md text-sm hover:bg-gray-50"
          >
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
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/6 ml-auto" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-3">User</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((u) => (
                    <tr key={u.userId || Math.random()} className="border-t hover:bg-gray-50">
                      <td className="py-3 flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                          style={{ background: `linear-gradient(135deg, ${colorFrom(u.username ?? u.email)}, #111827)` }}
                          title={u.username ?? u.email}
                          aria-hidden
                        >
                          {initialsOf(u)}
                        </div>
                        <div>
                          <div className="font-medium">{u.username ?? (u.email?.split("@")[0] ?? "-")}</div>
                          <div className="text-xs text-gray-500">{u.userId}</div>
                        </div>
                      </td>

                      <td className="py-3">
                        <div className="text-sm">{u.email}</div>
                      </td>

                      <td className="py-3">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 text-xs font-medium">Unverified</span>
                        )}
                      </td>

                      <td className="py-3 text-sm text-gray-600">
                        {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {list.length === 0 && !loading && (
                <div className="text-sm text-gray-500 py-6 text-center">No users found for this page / query.</div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Total: {total}</div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => fetchPage(page - 1)}
                >
                  Prev
                </button>
                <span className="text-sm">Page {page} / {totalPages}</span>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
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
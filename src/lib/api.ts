import axios, { type AxiosInstance, type AxiosRequestHeaders } from "axios";

export type AdminRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface AdminUser {
	_id: string;
	email: string;
	role: AdminRole;
}

export interface AuthResponse {
	success: boolean;
	data: {
		user: AdminUser;
		token: string;
	};
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
}

const DEFAULT_BASE_URL = "https://sanchara-api1.sreecharandesu.in";

const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || DEFAULT_BASE_URL;

let tokenSupplier: () => string | null = () => null;

export const setAuthTokenSupplier = (fn: () => string | null) => {
	tokenSupplier = fn;
};

export const createApiClient = (): AxiosInstance => {
	const instance = axios.create({
		baseURL: apiBaseUrl,
		headers: { "Content-Type": "application/json" },
		withCredentials: false,
	});

	instance.interceptors.request.use((config) => {
		const token = tokenSupplier();
		if (token) {
			if (!config.headers) {
				config.headers = {} as AxiosRequestHeaders;	
			}
			(config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
		}
		return config;
	});

	return instance;
};

export const api = createApiClient();

// Admin endpoints under /api/admin
export const AdminApi = {
	bootstrapSuperAdmin: (payload: { email: string; password: string; secret: string }) =>
		api.post<AuthResponse>("/api/admin/bootstrap-super-admin", payload).then(r => r.data),
	signup: (payload: { email: string; password: string }) =>
		api.post<AuthResponse>("/api/admin/signup", payload).then(r => r.data),
	signin: (payload: { email: string; password: string }) =>
		api.post<AuthResponse>("/api/admin/signin", payload).then(r => r.data),
	createAdmin: (payload: { email: string; password: string }) =>
		api.post<ApiResponse<{ user: AdminUser }>>("/api/admin/create", payload).then(r => r.data),
	// Cache dashboard metrics for the lifetime of the SPA session. Refresh clears it.
	_dashboardCache: null as ApiResponse<{ metrics: Record<string, unknown> }> | null,
	_dashboardCachePromise: null as Promise<ApiResponse<{ metrics: Record<string, unknown> }>> | null,
	dashboard: function () {
		if (this._dashboardCache) return Promise.resolve(this._dashboardCache);
		if (this._dashboardCachePromise) return this._dashboardCachePromise;
		this._dashboardCachePromise = api
			.get<ApiResponse<{ metrics: Record<string, unknown> }>>("/api/admin/dashboard")
			.then(r => {
				this._dashboardCache = r.data;
				return r.data;
			})
			.finally(() => {
				this._dashboardCachePromise = null;
			});
		return this._dashboardCachePromise;
	},
};



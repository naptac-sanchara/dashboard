import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type AdminUser, setAuthTokenSupplier } from "../lib/api";

type AuthState = {
	user: AdminUser | null;
	token: string | null;
	setAuth: (user: AdminUser, token: string) => void;
	clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			setAuth: (user, token) => set({ user, token }),
			clearAuth: () => set({ user: null, token: null }),
		}),
		{ name: "sanchara_admin_auth" }
	)
);

// Supply token to API layer
setAuthTokenSupplier(() => useAuthStore.getState().token);



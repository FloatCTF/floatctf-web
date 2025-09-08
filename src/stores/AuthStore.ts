import { create } from "zustand";
import { persist } from "zustand/middleware";
type AuthState = {
	token: string | null;
	adminToken: string | null;
	username: string | null;
	setToken: (token: string) => void;
	removeToken: () => void;
	setAdminToken: (token: string) => void;
	removeAdminToken: () => void;
};

export const useAuthStore = create(
	persist<AuthState>(
		(set) => ({
			token: null,
			adminToken: null,
			username: null,
			setToken: (token) => set({ token: token }),
			removeToken: () => set({ token: null }),
			setAdminToken: (token) => set({ adminToken: token }),
			removeAdminToken: () => set({ adminToken: null }),
		}),
		{
			name: "auth-storage",
		},
	),
);

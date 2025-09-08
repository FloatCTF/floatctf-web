import type { Challenge } from "@/routes/admin/challenges";
import type { Event } from "@/routes/admin/events";
import type { EventChallengeResult } from "@/routes/admin/events/$id";
import type { Instance } from "@/routes/admin/instances";
import type { User } from "@/routes/admin/users";
import { type QueryParams, type UniResponse, admin_api } from "../api/axios";

export const adminLoginFn = async ({
	username,
	password,
}: { username: string; password: string }): Promise<UniResponse<string>> => {
	const response = await admin_api.post("/session", { username, password });
	return response.data;
};

export const challengeAdminApi = {
	fetch: async (
		params: QueryParams = {},
	): Promise<UniResponse<Challenge[]>> => {
		const res = await admin_api.get("/challenges", { params });
		return res.data;
	},
	create: async (
		challenge: Partial<Challenge>,
	): Promise<UniResponse<Challenge>> => {
		const res = await admin_api.post("/challenges", challenge);
		return res.data;
	},
	patch: async (
		challenge: Partial<Challenge>,
	): Promise<UniResponse<Challenge>> => {
		const res = await admin_api.patch(`/challenges/${challenge.id}`, challenge);
		return res.data;
	},
	remove: async (id: string): Promise<UniResponse<number>> => {
		const res = await admin_api.delete(`/challenges/${id}`);
		return res.data;
	},
};

export const userAdminApi = {
	fetch: async (params: QueryParams = {}): Promise<UniResponse<User[]>> => {
		const res = await admin_api.get("/users", { params });
		console.log(res.data);
		return res.data;
	},
	create: async (user: Partial<User>): Promise<UniResponse<User>> => {
		const res = await admin_api.post("/users", user);
		return res.data;
	},
	patch: async (user: Partial<User>): Promise<UniResponse<User>> => {
		const res = await admin_api.patch(`/users/${user.id}`, user);
		return res.data;
	},
	remove: async (id: string): Promise<UniResponse<number>> => {
		const res = await admin_api.delete(`/users/${id}`);
		return res.data;
	},
};

export const eventAdminApi = {
	fetch: async (params: QueryParams = {}): Promise<UniResponse<Event[]>> => {
		const res = await admin_api.get("/events", { params });
		return res.data;
	},
	create: async (event: Partial<Event>): Promise<UniResponse<Event>> => {
		const res = await admin_api.post("/events", event);
		return res.data;
	},
	patch: async (event: Partial<Event>): Promise<UniResponse<Event>> => {
		const res = await admin_api.patch(`/events/${event.id}`, event);
		return res.data;
	},
	remove: async (id: string): Promise<UniResponse<number>> => {
		const res = await admin_api.delete(`/events/${id}`);
		return res.data;
	},
	get: async (id: string): Promise<UniResponse<Event>> => {
		const res = await admin_api.get(`/events/${id}`);
		return res.data;
	},
};

export const instanceAdminApi = {
	fetch: async (params: QueryParams = {}): Promise<UniResponse<Instance[]>> => {
		const res = await admin_api.get("/instances", { params });
		return res.data;
	},
};

export const eventChallengeAdminApi = {
	fetch: (event_id: string) => {
		return async (): Promise<UniResponse<EventChallengeResult[]>> => {
			const res = await admin_api.get(`/events/${event_id}/challenges`);
			return res.data;
		};
	},
	remove: (event_id: string) => {
		return async (id: string): Promise<UniResponse<number>> => {
			const res = await admin_api.delete(
				`/events/${event_id}/challenges/${id}`,
			);
			return res.data;
		};
	},
};

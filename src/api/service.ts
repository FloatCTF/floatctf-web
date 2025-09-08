import type { Challenge } from "@/routes/admin/challenges";
import type { Instance } from "@/routes/admin/instances";
import type { EventInfo, EventUser } from "@/routes/service/events";
import type { ChallengeSolve } from "@/routes/service/solves";
import { type QueryParams, type UniResponse, service_api } from "./axios";

export const userLoginFn = async ({
	username,
	password,
}: { username: string; password: string }): Promise<UniResponse<string>> => {
	const response = await service_api.post("/users/session", {
		username,
		password,
	});
	return response.data;
};

export const eventServiceApi = {
	fetch: async (
		params: QueryParams = {},
	): Promise<UniResponse<EventInfo[]>> => {
		const res = await service_api.get("/events", { params });
		return res.data;
	},
	join: async (event_id: string): Promise<UniResponse<EventUser>> => {
		const res = await service_api.post(`/events/${event_id}/join`);
		return res.data;
	},
	get: async (id: string): Promise<UniResponse<EventInfo>> => {
		const res = await service_api.get(`/events/${id}`);
		return res.data;
	},
	fetchChallenges: async (
		id: string,
		params: QueryParams = {},
	): Promise<UniResponse<Challenge[]>> => {
		const res = await service_api.get(`/events/${id}/challenges`, { params });
		return res.data;
	},
};

export const challengeServiceApi = {
	fetch: async (
		params: QueryParams = {},
	): Promise<UniResponse<Challenge[]>> => {
		const res = await service_api.get("/challenges", { params });
		return res.data;
	},
	get: async (id: string): Promise<UniResponse<Challenge>> => {
		const res = await service_api.get(`/challenges/${id}`);
		return res.data;
	},
	getInstance: async (id: string): Promise<UniResponse<Instance>> => {
		const res = await service_api.get(`/challenges/${id}/instance`);
		return res.data;
	},
};

export const instanceServiceApi = {
	launch: async (id: string): Promise<UniResponse<Instance>> => {
		const res = await service_api.post("/instances/launch", {
			challenge_id: id,
		});
		return res.data;
	},
	fetch: async (params: QueryParams = {}): Promise<UniResponse<Instance[]>> => {
		const res = await service_api.get("/instances", { params });
		return res.data;
	},
	destroy: async (id: string): Promise<UniResponse<number>> => {
		const res = await service_api.delete(`/instances/${id}`);
		return res.data;
	},
};

export const submitServiceApi = {
	submit: async ({
		instance_id,
		flag,
	}: { instance_id: string; flag: string }): Promise<
		UniResponse<ChallengeSolve>
	> => {
		const res = await service_api.post("/submit/flag", { instance_id, flag });
		return res.data;
	},
};

export const solveServiceApi = {
	fetch: async (
		params: QueryParams = {},
	): Promise<UniResponse<ChallengeSolve[]>> => {
		const res = await service_api.get("/solves", { params });
		return res.data;
	},
};

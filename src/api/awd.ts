/**
 * AWD admin + player API clients (canonical paths).
 * Admin:  /api/admin/awd/...
 * Player: /api/awd/...
 */
import { type UniResponse, admin_api, service_api } from "@/api/axios";

export type AwdGameBox = {
	id: string;
	team_id: string;
	template_id: string;
	status: string;
	gamebox_ip: string;
	container_name: string;
	health_status: string;
};

export type AwdScoreRow = {
	team_id: string;
	team_name: string;
	attack_score: number;
	defense_score: number;
	total_score: number;
	rank: number;
};

export type WireGuardConfigResponse = {
	config: string;
};

/** Admin AWD lifecycle (SuperAdmin). */
export const awdAdminApi = {
	createEvent: async (body: Record<string, unknown>): Promise<UniResponse<string>> => {
		const res = await admin_api.post("/awd/events", body);
		return res.data;
	},
	deploy: async (eventId: string): Promise<UniResponse<null>> => {
		const res = await admin_api.post(`/awd/events/${eventId}/deploy`);
		return res.data;
	},
	start: async (eventId: string): Promise<UniResponse<null>> => {
		const res = await admin_api.post(`/awd/events/${eventId}/start`);
		return res.data;
	},
	pause: async (eventId: string): Promise<UniResponse<null>> => {
		const res = await admin_api.post(`/awd/events/${eventId}/pause`);
		return res.data;
	},
	resume: async (eventId: string): Promise<UniResponse<null>> => {
		const res = await admin_api.post(`/awd/events/${eventId}/resume`);
		return res.data;
	},
	finish: async (eventId: string): Promise<UniResponse<null>> => {
		const res = await admin_api.post(`/awd/events/${eventId}/finish`);
		return res.data;
	},
	precheck: async (eventId: string): Promise<UniResponse<string>> => {
		const res = await admin_api.post(`/awd/events/${eventId}/precheck`);
		return res.data;
	},
	scores: async (eventId: string): Promise<UniResponse<AwdScoreRow[]>> => {
		const res = await admin_api.get(`/awd/events/${eventId}/scores`);
		return res.data;
	},
	archive: async (eventId: string): Promise<UniResponse<null>> => {
		const res = await admin_api.post(`/awd/events/${eventId}/archive`);
		return res.data;
	},
	resetGamebox: async (
		eventId: string,
		instanceId: string,
	): Promise<UniResponse<null>> => {
		const res = await admin_api.post(
			`/awd/events/${eventId}/gameboxes/${instanceId}/reset`,
		);
		return res.data;
	},
};

/** Player AWD endpoints (User JWT). */
export const awdPlayerApi = {
	gameboxes: async (eventId: string): Promise<UniResponse<AwdGameBox[]>> => {
		const res = await service_api.get(`/awd/events/${eventId}/gameboxes`);
		return res.data;
	},
	resetGamebox: async (
		eventId: string,
		instanceId: string,
	): Promise<UniResponse<null>> => {
		const res = await service_api.post(
			`/awd/events/${eventId}/gameboxes/${instanceId}/reset`,
		);
		return res.data;
	},
	submitFlag: async (
		eventId: string,
		flag: string,
	): Promise<UniResponse<null>> => {
		const res = await service_api.post(`/awd/events/${eventId}/submissions`, {
			flag,
		});
		return res.data;
	},
	scores: async (eventId: string): Promise<UniResponse<AwdScoreRow[]>> => {
		const res = await service_api.get(`/awd/events/${eventId}/scores`);
		return res.data;
	},
	wireguardConfig: async (
		eventId: string,
	): Promise<UniResponse<WireGuardConfigResponse>> => {
		const res = await service_api.get(
			`/awd/events/${eventId}/wireguard/config`,
		);
		return res.data;
	},
};

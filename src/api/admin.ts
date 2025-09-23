import type {
	BuildChallengeResult,
	Challenge,
	ChallengeCheckResult,
} from "@/routes/admin/challenges";
import type { SystemInformation } from "@/routes/admin/dashboard";
import type { Event } from "@/routes/admin/events";
import type { EventChallenge } from "@/routes/admin/events/$id";
import type { EventAnnouncement } from "@/routes/admin/events/$id/announcements";
import type { DataPresent } from "@/routes/admin/events/$id/data_present";
import type { EventUserResult } from "@/routes/admin/events/$id/users";
import type { EventWriteup } from "@/routes/admin/events/$id/writeups";
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
export const monitorApi = async (): Promise<UniResponse<SystemInformation>> => {
	const response = await admin_api.get("/monitor");
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
	importChallenge: async (
		file: File,
		isBatch: boolean,
	): Promise<UniResponse<null>> => {
		const form = new FormData();
		const field = isBatch ? "challenge_list_zip" : "challenge_zip";
		form.append(field, file, file.name);

		const res = await admin_api.post("/challenges/import", form, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return res.data;
	},
	checkChallenges: async (
		challenge_id_list?: string[],
	): Promise<UniResponse<ChallengeCheckResult[]>> => {
		const res = await admin_api.post("/challenges/check", {
			challenge_id_list,
		});
		return res.data;
	},
	buildChallenges: async (
		challenge_id_list?: string[],
	): Promise<UniResponse<BuildChallengeResult[]>> => {
		const res = await admin_api.post("/challenges/build", {
			challenge_id_list,
		});
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
	getData: async (id: string): Promise<UniResponse<DataPresent>> => {
		const res = await admin_api.get(`/events/${id}/data`);
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
	fetch: async (event_id: string) => {
		const res = await admin_api.get(`/events/${event_id}/challenges`);
		return res.data;
	},

	add: async ({
		event_id,
		challenge_id_list,
		challenge_id,
	}: {
		event_id: string;
		challenge_id_list?: string[];
		challenge_id?: string;
	}): Promise<UniResponse<EventChallenge[]>> => {
		const res = await admin_api.post(`/events/${event_id}/challenges`, {
			challenge_id_list,
			challenge_id,
		});
		return res.data;
	},
	remove: async ({
		event_id,
		challenge_id_list,
		challenge_id,
	}: {
		event_id: string;
		challenge_id_list?: string[];
		challenge_id?: string;
	}): Promise<UniResponse<number>> => {
		const res = await admin_api.delete(`/events/${event_id}/challenges`, {
			data: { challenge_id_list, challenge_id },
		});
		return res.data;
	},
	open: async ({
		event_id,
		challenge_id_list,
		challenge_id,
	}: {
		event_id: string;
		challenge_id_list?: string[];
		challenge_id?: string;
	}): Promise<UniResponse<EventChallenge[]>> => {
		const res = await admin_api.post(`/events/${event_id}/challenges/open`, {
			challenge_id_list,
			challenge_id,
		});
		return res.data;
	},
	hidden: async ({
		event_id,
		challenge_id_list,
		challenge_id,
	}: {
		event_id: string;
		challenge_id_list?: string[];
		challenge_id?: string;
	}): Promise<UniResponse<EventChallenge[]>> => {
		const res = await admin_api.post(`/events/${event_id}/challenges/hidden`, {
			challenge_id_list,
			challenge_id,
		});
		return res.data;
	},
};

export const eventUserAdminApi = {
	fetch: (event_id: string) => {
		return async (): Promise<UniResponse<EventUserResult[]>> => {
			const res = await admin_api.get(`/events/${event_id}/users`);
			return res.data;
		};
	},
	add: ({
		event_id,
		user_id,
		user_id_list,
	}: { event_id: string; user_id?: string; user_id_list?: string[] }): Promise<
		UniResponse<null>
	> => {
		return admin_api.post(`/events/${event_id}/users`, {
			user_id,
			user_id_list,
		});
	},
	delete: (event_id: string) => {
		return async (user_id: string): Promise<UniResponse<number>> => {
			const res = await admin_api.delete(
				`/events/${event_id}/users/${user_id}`,
			);
			return res.data;
		};
	},
	banned: async ({
		event_id,
		user_id,
	}: {
		event_id: string;
		user_id: string;
	}): Promise<UniResponse<EventUserResult>> => {
		const res = await admin_api.post(
			`/events/${event_id}/users/${user_id}/banned`,
		);
		return res.data;
	},
	unbanned: async ({
		event_id,
		user_id,
	}: {
		event_id: string;
		user_id: string;
	}): Promise<UniResponse<EventUserResult>> => {
		const res = await admin_api.post(
			`/events/${event_id}/users/${user_id}/unbanned`,
		);
		return res.data;
	},
};

export const eventAnnouncementAdminApi = {
	fetch: (event_id: string) => {
		return async (
			params: QueryParams = {},
		): Promise<UniResponse<EventAnnouncement[]>> => {
			const res = await admin_api.get(`/events/${event_id}/announcements`, {
				params,
			});
			return res.data;
		};
	},

	create: (event_id: string) => {
		return async (announcement: Partial<EventAnnouncement>) => {
			const res = await admin_api.post(
				`/events/${event_id}/announcements`,
				announcement,
			);
			return res.data;
		};
	},
	patch: (event_id: string) => {
		return async (announcement: Partial<EventAnnouncement>) => {
			const res = await admin_api.patch(
				`/events/${event_id}/announcements/${announcement.id}`,
				announcement,
			);
			return res.data;
		};
	},
	remove: (event_id: string) => {
		return async (id: string) => {
			const res = await admin_api.delete(
				`/events/${event_id}/announcements/${id}`,
			);
			return res.data;
		};
	},
};

export const eventWriteupAdminApi = {
	fetch: (event_id: string) => {
		return async (
			params: QueryParams = {},
		): Promise<UniResponse<EventWriteup[]>> => {
			const res = await admin_api.get(`/events/${event_id}/writeups`, {
				params,
			});
			return res.data;
		};
	},
};

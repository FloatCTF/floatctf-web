import type {
    Announcements,
    ChallengeSets,
    Challenges,
    EventAnnouncements,
    EventChallenges,
    EventLogs,
    EventWriteup,
    Events,
    Instances,
    Logs,
    ScheduledTasks,
    Settings,
    Users,
} from "@/entity";

import type {
    BuildChallengeResult,
    ChallengeCheckResult,
} from "@/routes/admin/challenges";
import type { SystemInformation } from "@/routes/admin/dashboard";

import type { DataPresent } from "@/routes/admin/events/jeopardy.$id/data_present";
import type { TeamResult } from "@/routes/admin/events/jeopardy.$id/teams";
import type { EventUserResult } from "@/routes/admin/events/jeopardy.$id/users";
import type { EventChallengeResult } from "@/routes/admin/events/jeopardy.$id";

import { type QueryParams, type UniResponse, admin_api } from "@/api/axios";
import type { Weapons } from "@/entity/weapons";
import type { SqlResult, SqlStatement } from "@/routes/admin/database";

export const adminLoginFn = async ({
    username,
    password,
}: {
    username: string;
    password: string;
}): Promise<UniResponse<string>> => {
    const response = await admin_api.post("/session", { username, password });
    return response.data;
};

export const systemAdminApi = {
    monitor: async (): Promise<UniResponse<SystemInformation>> => {
        const response = await admin_api.get("/system/monitor");
        return response.data;
    },
    changelog: async (): Promise<UniResponse<string>> => {
        const response = await admin_api.get("/system/changelog");
        return response.data;
    },
};

export const settingAdminApi = {
    fetch: async (): Promise<UniResponse<Settings[]>> => {
        const res = await admin_api.get("/settings");
        return res.data;
    },
    create: async (
        setting: Partial<Settings>,
    ): Promise<UniResponse<Settings>> => {
        const res = await admin_api.post("/settings", setting);
        return res.data;
    },
    remove: async (id_list: string[]): Promise<UniResponse<number>> => {
        const res = await admin_api.delete("/settings", { data: { id_list } });
        return res.data;
    },
    patch: async (
        setting: Partial<Settings>,
    ): Promise<UniResponse<Settings>> => {
        const res = await admin_api.patch(`/settings/${setting.id}`, setting);
        return res.data;
    },
};

export const announcementAdminApi = {
    fetch: async (
        params: QueryParams = {},
    ): Promise<UniResponse<Announcements[]>> => {
        const res = await admin_api.get("/announcements", { params });
        return res.data;
    },
    create: async (
        announcement: Partial<Announcements>,
    ): Promise<UniResponse<Announcements>> => {
        const res = await admin_api.post("/announcements", announcement);
        return res.data;
    },
    remove: async (id_list: string[]): Promise<UniResponse<number>> => {
        const res = await admin_api.delete("/announcements", {
            data: { id_list },
        });
        return res.data;
    },
    patch: async (
        announcement: Partial<Announcements>,
    ): Promise<UniResponse<Announcements>> => {
        const res = await admin_api.patch(
            `/announcements/${announcement.id}`,
            announcement,
        );
        return res.data;
    },
};

export const challengeAdminApi = {
    fetch: async (
        params: QueryParams = {},
    ): Promise<UniResponse<Challenges[]>> => {
        const res = await admin_api.get("/challenges", { params });
        return res.data;
    },
    create: async (
        challenge: Partial<Challenges>,
    ): Promise<UniResponse<Challenges>> => {
        const res = await admin_api.post("/challenges", challenge);
        return res.data;
    },
    patch: async (
        challenge: Partial<Challenges>,
    ): Promise<UniResponse<Challenges>> => {
        const res = await admin_api.patch(
            `/challenges/${challenge.id}`,
            challenge,
        );
        return res.data;
    },
    // todo: 批量删除
    remove: async (id_list: string[]): Promise<UniResponse<number>> => {
        const res = await admin_api.delete("/challenges", {
            data: { id_list },
        });
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
    getChallengeSets: async (
        params: QueryParams = {},
    ): Promise<UniResponse<ChallengeSets[]>> => {
        const res = await admin_api.get("/challenge_sets", { params });
        return res.data;
    },
    createChallengeSet: async (
        challenge_set: Partial<ChallengeSets>,
    ): Promise<UniResponse<ChallengeSets>> => {
        const res = await admin_api.post("/challenge_sets", challenge_set);
        return res.data;
    },
    deleteChallengeSet: async (
        id_list: string[],
    ): Promise<UniResponse<number>> => {
        const res = await admin_api.delete("/challenge_sets", {
            data: { id_list },
        });
        return res.data;
    },
    getChallengeSet: (id: string) => {
        return async (
            params: QueryParams = {},
        ): Promise<UniResponse<Challenges[]>> => {
            const res = await admin_api.get(`/challenge_sets/${id}`, {
                params,
            });
            return res.data;
        };
    },
    removeChallengeFromSet: (id: string) => {
        return async (id_list: string[]): Promise<UniResponse<number>> => {
            const res = await admin_api.delete(
                `/challenge_sets/${id}/challenges`,
                {
                    data: { id_list },
                },
            );
            return res.data;
        };
    },
    addChallengeToSet: async ({
        set_id,
        challenge_id_list,
    }: {
        set_id: string;
        challenge_id_list?: string[];
    }): Promise<UniResponse<null>> => {
        const res = await admin_api.post(
            `/challenge_sets/${set_id}/challenges`,
            {
                challenge_id_list,
            },
        );
        return res.data;
    },
    patchChallengeSet: async (
        challenge_set: Partial<ChallengeSets>,
    ): Promise<UniResponse<ChallengeSets>> => {
        const res = await admin_api.patch(
            `/challenge_sets/${challenge_set.id}`,
            challenge_set,
        );
        return res.data;
    },
};

export const userAdminApi = {
    fetch: async (params: QueryParams = {}): Promise<UniResponse<Users[]>> => {
        const res = await admin_api.get("/users", { params });
        console.log(res.data);
        return res.data;
    },
    create: async (user: Partial<Users>): Promise<UniResponse<Users>> => {
        const res = await admin_api.post("/users", user);
        return res.data;
    },
    patch: async (user: Partial<Users>): Promise<UniResponse<Users>> => {
        const res = await admin_api.patch(`/users/${user.id}`, user);
        return res.data;
    },
    remove: async (id_list: string[]): Promise<UniResponse<number>> => {
        const res = await admin_api.delete("/users", { data: { id_list } });
        return res.data;
    },
};

export const eventAdminApi = {
    fetch: async (params: QueryParams = {}): Promise<UniResponse<Events[]>> => {
        const res = await admin_api.get("/events", { params });
        return res.data;
    },
    create: async (event: Partial<Events>): Promise<UniResponse<Events>> => {
        const res = await admin_api.post("/events", event);
        return res.data;
    },
    patch: async (event: Partial<Events>): Promise<UniResponse<Events>> => {
        const res = await admin_api.patch(`/events/${event.id}`, event);
        return res.data;
    },
    remove: async (id_list: string[]): Promise<UniResponse<number>> => {
        const res = await admin_api.delete("/events", { data: { id_list } });
        return res.data;
    },
    get: async (id: string): Promise<UniResponse<Events>> => {
        const res = await admin_api.get(`/events/${id}`);
        return res.data;
    },
    getData: async (id: string): Promise<UniResponse<DataPresent>> => {
        const res = await admin_api.get(`/events/${id}/data`);
        return res.data;
    },
    getReport: async (event_id: string): Promise<UniResponse<string>> => {
        const res = await admin_api.get(`/events/${event_id}/report`);
        return res.data;
    },
    exportWriteUps: async (event_id: string): Promise<UniResponse<string>> => {
        const res = await admin_api.get(`/events/${event_id}/report`);
        return res.data;
    },
    createChallengeSet: async ({
        name,
        description,
        challenge_id_list,
    }: {
        name: string;
        description?: string;
        challenge_id_list: string[];
    }) => {
        const res = await admin_api.post("/challenge_sets", {
            name,
            description,
            challenge_id_list,
        });
        return res.data;
    },
};

export const instanceAdminApi = {
    fetch: async (
        params: QueryParams = {},
    ): Promise<UniResponse<Instances[]>> => {
        const res = await admin_api.get("/instances", { params });
        return res.data;
    },
};

export const eventChallengeAdminApi = {
    fetch: (event_id: string) => {
        return async (
            params: QueryParams = {},
        ): Promise<UniResponse<EventChallengeResult[]>> => {
            const res = await admin_api.get(`/events/${event_id}/challenges`, {
                params,
            });
            return res.data;
        };
    },

    add: async ({
        event_id,
        challenge_id_list,
        challenge_id,
    }: {
        event_id: string;
        challenge_id_list?: string[];
        challenge_id?: string;
    }): Promise<UniResponse<EventChallenges[]>> => {
        const res = await admin_api.post(`/events/${event_id}/challenges`, {
            challenge_id_list,
            challenge_id,
        });
        return res.data;
    },
    remove: (event_id: string) => {
        return async (id_list: string[]): Promise<UniResponse<number>> => {
            console.log(id_list);
            const res = await admin_api.delete(
                `/events/${event_id}/challenges`,
                {
                    data: { id_list },
                },
            );
            return res.data;
        };
    },
    open: async ({
        event_id,
        challenge_id_list,
        challenge_id,
    }: {
        event_id: string;
        challenge_id_list?: string[];
        challenge_id?: string;
    }): Promise<UniResponse<EventChallenges[]>> => {
        const res = await admin_api.post(
            `/events/${event_id}/challenges/open`,
            {
                challenge_id_list,
                challenge_id,
            },
        );
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
    }): Promise<UniResponse<EventChallenges[]>> => {
        const res = await admin_api.post(
            `/events/${event_id}/challenges/hidden`,
            {
                challenge_id_list,
                challenge_id,
            },
        );
        return res.data;
    },
};

export const eventUserAdminApi = {
    fetch: (event_id: string) => {
        return async (
            params: QueryParams = {},
        ): Promise<UniResponse<EventUserResult[]>> => {
            const res = await admin_api.get(`/events/${event_id}/users`, {
                params,
            });
            return res.data;
        };
    },
    add: ({
        event_id,
        user_id,
        user_id_list,
    }: {
        event_id: string;
        user_id?: string;
        user_id_list?: string[];
    }): Promise<UniResponse<null>> => {
        return admin_api.post(`/events/${event_id}/users`, {
            user_id,
            user_id_list,
        });
    },
    delete: (event_id: string) => {
        return async (id_list: string[]): Promise<UniResponse<number>> => {
            const res = await admin_api.delete(`/events/${event_id}/users`, {
                data: { id_list },
            });
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
        ): Promise<UniResponse<EventAnnouncements[]>> => {
            const res = await admin_api.get(
                `/events/${event_id}/announcements`,
                {
                    params,
                },
            );
            return res.data;
        };
    },

    create: (event_id: string) => {
        return async (announcement: Partial<EventAnnouncements>) => {
            const res = await admin_api.post(
                `/events/${event_id}/announcements`,
                announcement,
            );
            return res.data;
        };
    },
    patch: (event_id: string) => {
        return async (announcement: Partial<EventAnnouncements>) => {
            const res = await admin_api.patch(
                `/events/${event_id}/announcements/${announcement.id}`,
                announcement,
            );
            return res.data;
        };
    },
    remove: (event_id: string) => {
        return async (id_list: string[]) => {
            const res = await admin_api.delete(
                `/events/${event_id}/announcements`,
                {
                    data: { id_list },
                },
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

export const eventTeamAdminApi = {
    getTeams: (id: string) => {
        return async (): Promise<UniResponse<TeamResult[]>> => {
            const res = await admin_api.get(`/events/${id}/teams`);
            return res.data;
        };
    },
    remove: (id: string) => {
        return async (id_list: string[]): Promise<UniResponse<number>> => {
            const res = await admin_api.delete(`/events/${id}/teams`, {
                data: { id_list },
            });
            return res.data;
        };
    },
    banned: async ({
        event_id,
        team_id,
    }: {
        event_id: string;
        team_id: string;
    }) => {
        const res = await admin_api.post(
            `/events/${event_id}/teams/${team_id}/banned`,
        );
        return res.data;
    },
    unbanned: async ({
        event_id,
        team_id,
    }: {
        event_id: string;
        team_id: string;
    }) => {
        const res = await admin_api.post(
            `/events/${event_id}/teams/${team_id}/unbanned`,
        );
        return res.data;
    },
};

export const databaseAdminApi = {
    exec_sql: async ({
        sql,
    }: SqlStatement): Promise<UniResponse<SqlResult>> => {
        const res = await admin_api.post("/database/exec_sql", {
            sql,
        });

        return res.data;
    },
};

export const scheduledTaskAdminApi = {
    fetch: async (
        params: QueryParams = {},
    ): Promise<UniResponse<ScheduledTasks[]>> => {
        const res = await admin_api.get("/scheduled_tasks", { params });
        return res.data;
    },
    create: async (
        task: Partial<ScheduledTasks>,
    ): Promise<UniResponse<ScheduledTasks>> => {
        const res = await admin_api.post("/scheduled_tasks", task);
        return res.data;
    },
    patch: async (
        task: Partial<ScheduledTasks>,
    ): Promise<UniResponse<ScheduledTasks>> => {
        const res = await admin_api.patch(`/scheduled_tasks/${task.id}`, task);
        return res.data;
    },
    remove: async (id_list: string[]): Promise<UniResponse<number>> => {
        const res = await admin_api.delete("/scheduled_tasks", {
            data: { id_list },
        });
        return res.data;
    },
    run: async (task_id: string): Promise<UniResponse<ScheduledTasks>> => {
        const res = await admin_api.post(`/scheduled_tasks/${task_id}/run`);
        return res.data;
    },
};

export const weaponsAdminApi = {
    fetch: async (
        params: QueryParams = {},
    ): Promise<UniResponse<Weapons[]>> => {
        const res = await admin_api.get("/weapons", { params });
        return res.data;
    },
    create: async (weapon: Partial<Weapons>): Promise<UniResponse<Weapons>> => {
        const res = await admin_api.post("/weapons", weapon);
        return res.data;
    },
    patch: async (weapon: Partial<Weapons>): Promise<UniResponse<Weapons>> => {
        const res = await admin_api.patch(`/weapons/${weapon.id}`, weapon);
        return res.data;
    },
    remove: async (id_list: string[]): Promise<UniResponse<number>> => {
        const res = await admin_api.delete("/weapons", { data: { id_list } });
        return res.data;
    },
    upload: async (
        weapon_id: string,
        weapon: File,
    ): Promise<UniResponse<null>> => {
        const formData = new FormData();
        formData.append("weapon", weapon);

        const res = await admin_api.post(
            `/weapons/${weapon_id}/upload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        return res.data;
    },
};

export const logsAdminApi = {
    fetch: async (params: QueryParams = {}): Promise<UniResponse<Logs[]>> => {
        const res = await admin_api.get("/logs", { params });
        return res.data;
    },
};

export const eventLogAdminApi = {
    fetch: (event_id: string) => {
        return async (
            params: QueryParams = {},
        ): Promise<UniResponse<EventLogs[]>> => {
            const res = await admin_api.get(`/events/${event_id}/logs`, {
                params,
            });
            return res.data;
        };
    },
};

export const downloadAdminApi = {
    download: async (key: string): Promise<void> => {
        const res = await admin_api.get(`/download`, {
            params: { key },
        });
        const url = res.data.data;
        const blobRes = await fetch(url);
        const blob = await blobRes.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = key.split("/").pop() || "download";
        a.click();
        URL.revokeObjectURL(blobUrl);
    },
};

export interface FloatDockerContainer {
    id: string;
    name: string;
    challenge_name?: string;
    event_name?: string;
    net_info: string;
    status: string;
    image_name: string;
    uptime: string;
}

export interface ContainerInfo {
    id: string;
    names: string[];
    image: string;
    image_id: string;
    state: string;
    status: string;
    created: number;
    ports: PortInfo[];
}

export interface PortInfo {
    IP?: string;
    PrivatePort: number;
    PublicPort?: number;
    Type: string;
}

export interface ImageInfo {
    id: string;
    repo_tags: string[];
    size: number;
    created: number;
}

export interface NetworkInfo {
    id: string;
    name: string;
    driver: string;
    scope: string;
    ipam_driver: string;
    subnet?: string;
    gateway?: string;
    created: number;
}

export const dockerAdminApi = {
    fetchContainers: async (
        params: QueryParams = {},
    ): Promise<UniResponse<FloatDockerContainer[]>> => {
        const res = await admin_api.get("/docker/containers", { params });
        return res.data;
    },
    getContainer: async (
        container_id: string,
    ): Promise<UniResponse<ContainerInfo>> => {
        const res = await admin_api.get(`/docker/containers/${container_id}`);
        return res.data;
    },
    stopContainer: async (container_id: string): Promise<UniResponse<null>> => {
        const res = await admin_api.post(
            `/docker/containers/${container_id}/stop`,
        );
        return res.data;
    },
    startContainer: async (
        container_id: string,
    ): Promise<UniResponse<null>> => {
        const res = await admin_api.post(
            `/docker/containers/${container_id}/start`,
        );
        return res.data;
    },
    deleteContainer: async (
        container_id: string,
    ): Promise<UniResponse<null>> => {
        const res = await admin_api.delete(
            `/docker/containers/${container_id}`,
        );
        return res.data;
    },
    fetchImages: async (
        params: QueryParams = {},
    ): Promise<UniResponse<ImageInfo[]>> => {
        const res = await admin_api.get("/docker/images", { params });
        return res.data;
    },
    deleteImage: async (image_id: string): Promise<UniResponse<null>> => {
        const res = await admin_api.delete(`/docker/images/${image_id}`);
        return res.data;
    },
    fetchNetworks: async (
        params: QueryParams = {},
    ): Promise<UniResponse<NetworkInfo[]>> => {
        const res = await admin_api.get("/docker/networks", { params });
        return res.data;
    },
    createNetwork: async (network: {
        name: string;
        subnet: string;
        gateway: string;
        driver?: string;
    }): Promise<UniResponse<NetworkInfo>> => {
        const res = await admin_api.post("/docker/networks", network);
        return res.data;
    },
    deleteNetwork: async (network_id: string): Promise<UniResponse<null>> => {
        const res = await admin_api.delete(`/docker/networks/${network_id}`);
        return res.data;
    },
};

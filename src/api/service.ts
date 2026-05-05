import type {
    Announcements,
    ChallengeSetItems,
    ChallengeSets,
    ChallengeSolves,
    ChallengeWriteup,
    Challenges,
    EventAnnouncements,
    EventInstances,
    EventTeams,
    EventUsers,
    Events,
    Instances,
    Users,
} from "@/entity";
import type { Weapons } from "@/entity/weapons";
import type { ChallengeWriteupResult } from "@/routes/service/challenges/$id/writeup";
import type { EventInfo } from "@/routes/service/events";
import type { EventChallengeResult } from "@/routes/service/events/jeopardy.$id/challenges";
import type { EventInstanceResult } from "@/routes/service/events/jeopardy.$id/instances";
import type { ScoreboardItem } from "@/routes/service/events/jeopardy.$id/scoreboard";
import type { TrendItem } from "@/routes/service/events/jeopardy.$id/trend";
import type { TopUser } from "@/routes/service/top";
import { type QueryParams, type UniResponse, service_api } from "./axios";

export const userServiceApi = {
    getMe: async (): Promise<UniResponse<Users>> => {
        const response = await service_api.get("/users/me");
        return response.data;
    },
    patchMe: async (data: Partial<Users>): Promise<UniResponse<Users>> => {
        const response = await service_api.patch("/users/me", data);
        return response.data;
    },
    login: async ({
        username,
        password,
    }: {
        username: string;
        password: string;
    }): Promise<UniResponse<string>> => {
        const response = await service_api.post("/users/session", {
            username,
            password,
        });
        return response.data;
    },
    register: async ({
        username,
        password,
        nickname,
        email,
    }: {
        username: string;
        password: string;
        nickname: string;
        email: string;
    }): Promise<UniResponse<string>> => {
        const response = await service_api.post("/users", {
            username,
            password,
            nickname,
            email,
        });
        return response.data;
    },
    resetPassword: async ({
        username,
        email,
    }: {
        username?: string;
        email?: string;
    }): Promise<UniResponse<string>> => {
        const response = await service_api.post("/users/reset_password", {
            username,
            email,
        });
        return response.data;
    },
    reset: async ({
        token,
        password,
        confirmed_password,
    }: {
        token: string;
        password: string;
        confirmed_password: string;
    }): Promise<UniResponse<string>> => {
        const response = await service_api.post(`/users/reset?token=${token}`, {
            password,
            confirmed_password,
        });
        return response.data;
    },
};

export const eventServiceApi = {
    fetch: async (
        params: QueryParams = {},
    ): Promise<UniResponse<EventInfo[]>> => {
        const res = await service_api.get("/events", { params });
        return res.data;
    },
    join: async (event_id: string): Promise<UniResponse<EventUsers>> => {
        const res = await service_api.post(`/events/${event_id}/join`);
        return res.data;
    },
    leave: async (event_id: string): Promise<UniResponse<number>> => {
        const res = await service_api.delete(`/events/${event_id}/leave`);
        return res.data;
    },
    createTeam: async ({
        event_id,
        name,
    }: {
        event_id: string;
        name: string;
    }): Promise<UniResponse<EventTeams>> => {
        const res = await service_api.post(`/events/${event_id}/team`, {
            name,
        });
        return res.data;
    },
    joinTeam: async ({
        event_id,
        team_id,
    }: {
        event_id: string;
        team_id: string;
    }): Promise<UniResponse<null>> => {
        const res = await service_api.post(
            `/events/${event_id}/team/${team_id}/join`,
        );
        return res.data;
    },
    quitTeam: async ({
        event_id,
        team_id,
    }: {
        event_id: string;
        team_id: string;
    }): Promise<UniResponse<null>> => {
        const res = await service_api.delete(
            `/events/${event_id}/team/${team_id}`,
        );
        return res.data;
    },
    get: async (id: string): Promise<UniResponse<EventInfo>> => {
        const res = await service_api.get(`/events/${id}`);
        return res.data;
    },
    fetchChallenges: async (
        id: string,
        params: QueryParams = {},
    ): Promise<UniResponse<EventChallengeResult[]>> => {
        const res = await service_api.get(`/events/${id}/challenges`, {
            params,
        });
        return res.data;
    },
    getChallengeInstance: async (
        event_id: string,
        challenge_id: string,
    ): Promise<UniResponse<Instances>> => {
        const res = await service_api.get(
            `/events/${event_id}/challenges/${challenge_id}/instance`,
        );
        return res.data;
    },
    getInstances: async (
        event_id: string,
    ): Promise<UniResponse<EventInstanceResult[]>> => {
        const res = await service_api.get(`/events/${event_id}/instances`);
        return res.data;
    },
    launchSingleInstance: async (
        event_id: string,
        challenge_id: string,
    ): Promise<UniResponse<Instances>> => {
        const res = await service_api.post("/instances/launch", {
            challenge_id,
            event_id,
        });
        return res.data;
    },
    getScoreboard: async (
        event_id: string,
    ): Promise<UniResponse<ScoreboardItem[]>> => {
        const res = await service_api.get(`/events/${event_id}/scoreboard`);
        return res.data;
    },
    getTrend: async (event_id: string): Promise<UniResponse<TrendItem[]>> => {
        const res = await service_api.get(`/events/${event_id}/trend`);
        return res.data;
    },
    getAnnouncements: async (
        event_id: string,
    ): Promise<UniResponse<EventAnnouncements[]>> => {
        const res = await service_api.get(`/events/${event_id}/announcements`);
        return res.data;
    },
    getWriteUpCreatedDate: async (
        event_id: string,
    ): Promise<UniResponse<string>> => {
        const res = await service_api.get(
            `/events/${event_id}/submit_wp_status`,
        );
        return res.data;
    },
};

export const challengeServiceApi = {
    fetch: async (
        params: QueryParams = {},
    ): Promise<UniResponse<Challenges[]>> => {
        const res = await service_api.get("/challenges", { params });
        return res.data;
    },
    get: async (id: string): Promise<UniResponse<Challenges>> => {
        const res = await service_api.get(`/challenges/${id}`);
        return res.data;
    },
    getInstance: async (id: string): Promise<UniResponse<Instances>> => {
        const res = await service_api.get(`/challenges/${id}/instance`);
        return res.data;
    },
    getMyWriteup: async (
        challenge_id: string,
    ): Promise<UniResponse<ChallengeWriteup>> => {
        const res = await service_api.get(
            `/challenges/${challenge_id}/my_writeup`,
        );
        return res.data;
    },
    createMyWriteup: async ({
        challenge_id,
        content,
    }: {
        challenge_id: string;
        content: string;
    }): Promise<UniResponse<ChallengeWriteup>> => {
        const res = await service_api.post(
            `/challenges/${challenge_id}/my_writeup`,
            {
                content,
            },
        );
        return res.data;
    },
    getWriteup: async (
        id: string,
    ): Promise<UniResponse<ChallengeWriteupResult>> => {
        const res = await service_api.get(`/writeups/${id}`);
        return res.data;
    },
    getWriteups: async (
        challenge_id: string,
    ): Promise<UniResponse<ChallengeWriteupResult[]>> => {
        const res = await service_api.get(
            `/challenges/${challenge_id}/writeups`,
        );
        return res.data;
    },
    getAllWriteups: async (
        params: QueryParams = {},
    ): Promise<UniResponse<ChallengeWriteupResult[]>> => {
        const res = await service_api.get("/writeups", { params });
        return res.data;
    },
    getChallengeSets: async (): Promise<UniResponse<ChallengeSets[]>> => {
        const res = await service_api.get("/challenge_sets");
        return res.data;
    },
    getChallengeSet: async (id: string): Promise<UniResponse<Challenges[]>> => {
        const res = await service_api.get(`/challenge_sets/${id}`);
        return res.data;
    },
};

export const instanceServiceApi = {
    launch: async (id: string): Promise<UniResponse<Instances>> => {
        const res = await service_api.post("/instances/launch", {
            challenge_id: id,
        });
        return res.data;
    },
    launchSingle: async (
        challenge_id: string,
        event_id: string,
    ): Promise<UniResponse<Instances>> => {
        const res = await service_api.post("/instances/launch", {
            challenge_id,
            event_id,
        });
        return res.data;
    },
    fetch: async (
        params: QueryParams = {},
    ): Promise<UniResponse<Instances[]>> => {
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
    }: {
        instance_id: string;
        flag: string;
    }): Promise<UniResponse<ChallengeSolves>> => {
        const res = await service_api.post("/submit/flag", {
            instance_id,
            flag,
        });
        return res.data;
    },
    // 	#[derive(Debug, MultipartForm)]
    // pub struct WriteupForm {
    //     #[multipart(limit = "1024MB")]
    //     writeup_pdf: TempFile,
    //     event_id: Text<Uuid>,
    //     team_id: Option<Text<Uuid>>,
    // }
    submitWriteup: async (
        file: File,
        event_id: string,
        team_id?: string,
    ): Promise<UniResponse<null>> => {
        const formData = new FormData();
        formData.append("writeup_pdf", file);
        formData.append("event_id", event_id);
        if (team_id) {
            formData.append("team_id", team_id);
        }
        const res = await service_api.post("/submit/writeup", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    },
    submitSingle: async ({
        event_id,
        instance_id,
        flag,
    }: {
        event_id: string;
        instance_id: string;
        flag: string;
    }): Promise<UniResponse<ChallengeSolves>> => {
        const res = await service_api.post("/submit/flag", {
            event_id,
            instance_id,
            flag,
        });
        return res.data;
    },
};

export const solveServiceApi = {
    fetch: async (
        params: QueryParams = {},
    ): Promise<UniResponse<ChallengeSolves[]>> => {
        const res = await service_api.get("/solves", { params });
        return res.data;
    },
    getTop15Users: async (): Promise<UniResponse<TopUser[]>> => {
        const res = await service_api.get("/solves/top15users");
        return res.data;
    },
};

export const weaponsServiceApi = {
    fetch: async (
        params: QueryParams = {},
    ): Promise<UniResponse<Weapons[]>> => {
        const res = await service_api.get("/weapons", { params });
        return res.data;
    },
};

export const announcementServiceApi = {
    fetch: async (
        params: QueryParams = {},
    ): Promise<UniResponse<Announcements[]>> => {
        const res = await service_api.get("/announcements", { params });
        return res.data;
    },
};

export const uploadsServiceApi = {
    upload_image: async (image_file: File): Promise<UniResponse<string>> => {
        const formData = new FormData();
        formData.append("image_file", image_file);
        const res = await service_api.post("/uploads/image", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    },
};

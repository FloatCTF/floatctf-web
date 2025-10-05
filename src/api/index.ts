export * from "@/api/axios";
import {
	adminLoginFn,
	challengeAdminApi,
	eventAdminApi,
	eventAnnouncementAdminApi,
	eventChallengeAdminApi,
	eventTeamAdminApi,
	eventUserAdminApi,
	eventWriteupAdminApi,
	instanceAdminApi,
	monitorApi,
	settingAdminApi,
	userAdminApi,
} from "@/api/admin";

import {
	challengeServiceApi,
	eventServiceApi,
	instanceServiceApi,
	solveServiceApi,
	submitServiceApi,
	userServiceApi,
} from "./service";

export const adminApi = {
	login: adminLoginFn,
	monitor: monitorApi,
	settings: settingAdminApi,
	challenges: challengeAdminApi,
	users: userAdminApi,
	events: eventAdminApi,
	instances: instanceAdminApi,
	event_challenges: eventChallengeAdminApi,
	event_users: eventUserAdminApi,
	event_announcements: eventAnnouncementAdminApi,
	event_writeups: eventWriteupAdminApi,
	event_teams: eventTeamAdminApi,
};

export const serviceApi = {
	users: userServiceApi,
	events: eventServiceApi,
	challenges: challengeServiceApi,
	instances: instanceServiceApi,
	submit: submitServiceApi,
	solves: solveServiceApi,
};

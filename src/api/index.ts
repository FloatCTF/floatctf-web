export * from "@/api/axios";
import {
    adminLoginFn,
    announcementAdminApi,
    challengeAdminApi,
    databaseAdminApi,
    dockerAdminApi,
    eventAdminApi,
    eventLogAdminApi,
    eventAnnouncementAdminApi,
    eventChallengeAdminApi,
    eventTeamAdminApi,
    eventUserAdminApi,
    eventWriteupAdminApi,
    instanceAdminApi,
    logsAdminApi,
    scheduledTaskAdminApi,
    settingAdminApi,
    systemAdminApi,
    userAdminApi,
    weaponsAdminApi,
    downloadAdminApi,
    type FloatDockerContainer,
    type ImageInfo,
    type NetworkInfo,
} from "@/api/admin";

import {
    announcementServiceApi,
    challengeServiceApi,
    eventServiceApi,
    instanceServiceApi,
    solveServiceApi,
    submitServiceApi,
    userServiceApi,
    weaponsServiceApi,
} from "./service";

export type { FloatDockerContainer, ImageInfo, NetworkInfo };

export const adminApi = {
    login: adminLoginFn,
    system: systemAdminApi,
    settings: settingAdminApi,
    announcements: announcementAdminApi,
    challenges: challengeAdminApi,
    users: userAdminApi,
    events: eventAdminApi,
    instances: instanceAdminApi,
    event_challenges: eventChallengeAdminApi,
    event_users: eventUserAdminApi,
    event_announcements: eventAnnouncementAdminApi,
    event_logs: eventLogAdminApi,
    event_writeups: eventWriteupAdminApi,
    event_teams: eventTeamAdminApi,
    database: databaseAdminApi,
    scheduled_tasks: scheduledTaskAdminApi,
    weapons: weaponsAdminApi,
    logs: logsAdminApi,
    download: downloadAdminApi,
    docker: dockerAdminApi,
};

export const serviceApi = {
    users: userServiceApi,
    events: eventServiceApi,
    challenges: challengeServiceApi,
    instances: instanceServiceApi,
    submit: submitServiceApi,
    solves: solveServiceApi,
    weapons: weaponsServiceApi,
    announcements: announcementServiceApi,
};
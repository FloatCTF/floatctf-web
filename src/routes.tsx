import type { NavRoute } from "@/components/SideBar";
import {
  ContainerIcon,
  DatabaseIcon,
  FlameIcon,
  GearIcon,
  GoalIcon,
  ListUnorderedIcon,
  LogIcon,
  NoteIcon,
  PasskeyFillIcon,
  PersonIcon,
  TasklistIcon,
  TelescopeIcon,
  TerminalIcon,
} from "@primer/octicons-react";

export const admin_routes: NavRoute[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <GoalIcon /> },
  {
    label: "Users",
    path: "/admin/users",
    icon: <PasskeyFillIcon />,
  },

  {
    label: "Challenges",
    path: "/admin/challenges",
    icon: <ListUnorderedIcon />,
  },
  {
    label: "Challenge Sets",
    path: "/admin/challenge_sets",
    icon: <TasklistIcon />,
  },

  {
    label: "Instances",
    path: "/admin/instances",
    icon: <ListUnorderedIcon />,
  },

  {
    label: "Events",
    path: "/admin/events",
    icon: <ListUnorderedIcon />,
  },
  {
    label: "Docker",
    path: "/admin/docker",
    icon: <ContainerIcon />,
  },
  {
    label: "Database",
    path: "/admin/database",
    icon: <DatabaseIcon />,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: <GearIcon />,
  },
];

export const service_routes: NavRoute[] = [
  { label: "Top Users", path: "/service/top", icon: <GoalIcon size={18} /> },
  {
    label: "Events",
    path: "/service/events",
    icon: <TelescopeIcon size={18} />,
  },
  {
    label: "Challenges",
    path: "/service/challenges",
    icon: <ListUnorderedIcon size={18} />,
  },
  {
    label: "Challenge Sets",
    path: "/service/challenge_sets",
    icon: <TasklistIcon size={18} />,
  },
  {
    label: "Instances",
    path: "/service/instances",
    icon: <FlameIcon size={18} />,
  },
  {
    label: "Writeups",
    path: "/service/writeups",
    icon: <NoteIcon size={18} />,
  },
  {
    label: "Solves",
    path: "/service/solves",
    icon: <LogIcon size={18} />,
  },
  {
    label: "Profile",
    path: "/service/profile",
    icon: <PersonIcon size={18} />,
  },
];

export const admin_ignore_routes: string[] = ["/admin", "/admin/"];

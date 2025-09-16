import {
  FileIcon,
  GoalIcon,
  ListUnorderedIcon,
  PasskeyFillIcon,
} from "@primer/octicons-react";
export type NavRoute = {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavRoute[];
};

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
    label: "Instances",
    path: "/admin/instances",
    icon: <ListUnorderedIcon />,
  },

  {
    label: "Events",
    path: "/admin/events",
    icon: <ListUnorderedIcon />,
  },
];

export const admin_ignore_routes: string[] = ["/admin", "/admin/"];

export const service_routes: NavRoute[] = [
  { label: "Top Users", path: "/service/top", icon: <GoalIcon /> },
  {
    label: "Training",
    icon: <FileIcon />,
    children: [
      {
        label: "Challenges",
        path: "/service/challenges",
        icon: <ListUnorderedIcon />,
      },
      {
        label: "Instances",
        path: "/service/instances",
        icon: <ListUnorderedIcon />,
      },
      {
        label: "Solves",
        path: "/service/solves",
        icon: <ListUnorderedIcon />,
      },
    ],
  },

  {
    label: "Events",
    path: "/service/events",
    icon: <ListUnorderedIcon />,
  },
];

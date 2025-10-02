import { userAdminApi } from "@/api/admin";
import { GenericTable } from "@/components/admin/Table";
import { TextInput } from "@primer/react";
import { createFileRoute } from "@tanstack/react-router";
import { useReactive } from "ahooks";
import { AdminRouteGuard } from "./route";
export const Route = createFileRoute("/admin/users")({
  component: RouteComponent,
  loader: AdminRouteGuard,
});
export type User = {
  id: string; // Uuid
  username: string;
  password: string;
  nickname: string;
  email: string;
};
function RouteComponent() {
  const columns = [
    { accessorKey: "id", header: "ID", field: "id", rowHeader: true },
    {
      accessorKey: "username",
      header: "Username",
      field: "username",
      sortBy: true,
    },
    {
      accessorKey: "nickname",
      header: "Nickname",
      field: "nickname",
      sortBy: true,
    },
    { accessorKey: "email", header: "Email", field: "email", sortBy: true },
  ];

  const mutationUser = useReactive<Partial<User>>({
    username: "",
    email: "",
    password: "",
    nickname: "",
  });

  const mutationColumns = [
    {
      header: "Username",
      field: "username",
      render: (
        <TextInput
          value={mutationUser.username}
          onChange={(e) => {
            mutationUser.username = e.target.value;
          }}
        />
      ),
    },
    {
      header: "Email",
      field: "email",
      render: (
        <TextInput
          value={mutationUser.email}
          onChange={(e) => {
            mutationUser.email = e.target.value;
          }}
        />
      ),
    },
    {
      header: "Nickname",
      field: "nickname",
      render: (
        <TextInput
          value={mutationUser.nickname}
          onChange={(e) => {
            mutationUser.nickname = e.target.value;
          }}
        />
      ),
    },
    {
      header: "Password",
      field: "password",
      render: (
        <TextInput
          value={mutationUser.password}
          onChange={(e) => {
            mutationUser.password = e.target.value;
          }}
        />
      ),
    },
  ];

  return (
    <GenericTable
      subject="Users"
      columns={columns}
      queryFn={userAdminApi.fetch}
      createFn={userAdminApi.create}
      removeFn={userAdminApi.remove}
      patchFn={userAdminApi.patch}
      mutationColumns={mutationColumns}
      mutationData={mutationUser}
    />
  );
}

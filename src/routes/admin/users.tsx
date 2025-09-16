import { userAdminApi } from "@/api/admin";
import { GenericTable } from "@/components/admin/Table";
import { useTypedState } from "@/lib";
import { TextInput } from "@primer/react";
import { createFileRoute } from "@tanstack/react-router";
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

  const mutationUser = useTypedState<Partial<User>>({
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
          value={mutationUser.state.username}
          onChange={(e) => {
            mutationUser.update("username", e.target.value);
          }}
        />
      ),
    },
    {
      header: "Email",
      field: "email",
      render: (
        <TextInput
          value={mutationUser.state.email}
          onChange={(e) => {
            mutationUser.update("email", e.target.value);
          }}
        />
      ),
    },
    {
      header: "Nickname",
      field: "nickname",
      render: (
        <TextInput
          value={mutationUser.state.nickname}
          onChange={(e) => {
            mutationUser.update("nickname", e.target.value);
          }}
        />
      ),
    },
    {
      header: "Password",
      field: "password",
      render: (
        <TextInput
          value={mutationUser.state.password}
          onChange={(e) => {
            mutationUser.update("password", e.target.value);
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

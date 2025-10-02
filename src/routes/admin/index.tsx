import { adminLoginFn } from "@/api/admin";
import SiteTitle from "@/components/SiteTitle";

import { useAuthStore } from "@/stores/AuthStore";
import { Avatar, Button, FormControl, Heading, TextInput } from "@primer/react";
import { InlineMessage } from "@primer/react/experimental";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useReactive } from "ahooks";
import * as React from "react";
import { AdminRouteGuardWithRedirect } from "./route";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
  loader: AdminRouteGuardWithRedirect,
});

type MessageVariant = "critical" | "success" | "unavailable" | "warning";

function RouteComponent() {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const form = useReactive({
    username: "",
    password: "",
    hidden: true,
    status: "critical" as MessageVariant,
    message: "",
    buttonMessage: "Sign in",
    buttonDisabled: false,
  });

  const mutation = useMutation({
    mutationFn: adminLoginFn,
    onMutate: () => {
      form.hidden = true;
      form.buttonDisabled = true;
      form.buttonMessage = "Signing in...";
    },
    onSuccess: (data) => {
      authStore.setAdminToken(data.data!);
      form.hidden = false;
      form.status = "success";
      form.message = "Login successful";
      form.buttonDisabled = true;
      form.buttonMessage = "Redirecting...";
      // redirect to admin dashboard
      navigate({ to: "/admin/dashboard" });
    },
    onError: (error) => {
      console.log(error);
      form.hidden = true;
      form.status = "critical";
      form.message = "Invalid username or password";

      form.buttonDisabled = false;
      form.buttonMessage = "Sign in";
      authStore.removeAdminToken();
    },
  });

  const usernameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    SiteTitle({ title: "Admin Login" });
    usernameRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center pt-9 gap-5">
      <Avatar size={100} src="/float.png" />
      <Heading>Sign in to FloatCTF Admin</Heading>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("submit");
          if (form.username === "" || form.password === "") {
            form.hidden = true;
            form.status = "critical";
            form.message = "Please fill in all fields";

            return;
          }
          mutation.mutate({
            username: form.username,
            password: form.password,
          });
        }}
        className="flex flex-col gap-2 w-48"
      >
        <FormControl required>
          <FormControl.Label>Username</FormControl.Label>
          <TextInput
            className="w-full"
            ref={usernameRef}
            name="username"
            value={form.username}
            onChange={(e) => {
              form.username = e.target.value;
            }}
          />
        </FormControl>

        <FormControl required>
          <FormControl.Label>Password</FormControl.Label>
          <TextInput
            className="w-full"
            type="password"
            name="password"
            value={form.password}
            onChange={(e) => {
              form.password = e.target.value;
            }}
          />
        </FormControl>

        <Button type="submit" variant="primary" disabled={form.buttonDisabled}>
          {form.buttonMessage}
        </Button>
      </form>

      {!form.hidden && (
        <InlineMessage variant={form.status}>{form.message}</InlineMessage>
      )}
    </div>
  );
}

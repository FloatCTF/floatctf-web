import { userLoginFn } from "@/api/service";
import SiteTitle from "@/components/SiteTitile";
import { useTypedState } from "@/lib";
import { useAuthStore } from "@/stores/AuthStore";
import { Avatar, Button, FormControl, Heading, TextInput } from "@primer/react";
import { InlineMessage } from "@primer/react/experimental";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useEffect, useRef } from "react";
import { ServiceRouteGuardWithRedirect } from "./service/route";

export const Route = createFileRoute("/")({
  component: App,
  loader: ServiceRouteGuardWithRedirect,
});

type MessageVariant = "critical" | "success" | "unavailable" | "warning";

function App() {
  const form = useTypedState({
    username: "",
    password: "",
    hidden: true,
    status: "critical" as MessageVariant,
    message: "",
    buttonMessage: "Sign in",
    buttonDisabled: false,
  });

  const usernameRef = useRef<HTMLInputElement>(null);
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: userLoginFn,
    onMutate: () => {
      form.update("hidden", true);
      form.update("buttonMessage", "Signing in...");
      form.update("buttonDisabled", true);
    },
    onSuccess: (data) => {
      authStore.setToken(data.data!);
      form.update("hidden", false);
      form.update("status", "success");
      form.update("message", "Login successful");
      form.update("buttonMessage", "Redirecting...");
      // redirect to admin dashboard
      authStore.setUsername(form.state.username);

      navigate({ to: "/service" });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg =
        error.response?.data?.message || error.message || "Unknown error";
      form.update("hidden", false);
      form.update("status", "critical");
      form.update("message", msg);

      form.update("buttonMessage", "Sign in");
      form.update("buttonDisabled", false);
      authStore.removeToken();
    },
  });
  useEffect(() => {
    SiteTitle({ title: "Login" });
    usernameRef.current?.focus();
  }, []);
  return (
    <div className="flex flex-col items-center justify-center pt-9 gap-5">
      <Avatar size={100} src="/float.png" />
      <Heading>Sign in to FloatCTF</Heading>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (form.state.username === "" || form.state.password === "") {
            form.update("hidden", false);
            form.update("status", "critical");
            form.update("message", "Please fill in all fields");
            return;
          }
          mutation.mutate({
            username: form.state.username,
            password: form.state.password,
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
            placeholder="学号"
            value={form.state.username}
            onChange={(e) => {
              form.update("username", e.target.value);
            }}
          />
        </FormControl>

        <FormControl required>
          <FormControl.Label>Password</FormControl.Label>
          <TextInput
            className="w-full"
            type="password"
            name="password"
            value={form.state.password}
            onChange={(e) => {
              form.update("password", e.target.value);
            }}
          />
        </FormControl>

        <Button
          type="submit"
          variant="primary"
          disabled={form.state.buttonDisabled}
        >
          {form.state.buttonMessage}
        </Button>
      </form>

      {!form.state.hidden && (
        <InlineMessage variant={form.state.status}>
          {form.state.message}
        </InlineMessage>
      )}
    </div>
  );
}

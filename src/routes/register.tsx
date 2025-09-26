import { userRegisterFn } from "@/api/service";
import SiteTitle from "@/components/SiteTitile";
import { useTypedState } from "@/lib";
import { Avatar, Button, FormControl, Heading, TextInput } from "@primer/react";
import { InlineMessage } from "@primer/react/experimental";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useEffect, useRef } from "react";
import { ServiceRouteGuardWithRedirect } from "./service/route";

export const Route = createFileRoute("/register")({
  component: Register,
  loader: ServiceRouteGuardWithRedirect,
});

type MessageVariant = "critical" | "success" | "unavailable" | "warning";

function Register() {
  const form = useTypedState({
    username: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
    hidden: true,
    status: "critical" as MessageVariant,
    message: "",
    buttonMessage: "Register",
    buttonDisabled: false,
  });

  const usernameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: userRegisterFn,
    onMutate: () => {
      form.update("hidden", true);
      form.update("buttonMessage", "Registering...");
      form.update("buttonDisabled", true);
    },
    onSuccess: () => {
      form.update("hidden", false);
      form.update("status", "success");
      form.update(
        "message",
        "Registration successful! Redirecting to login..."
      );
      form.update("buttonMessage", "Success");

      setTimeout(() => {
        navigate({ to: "/" });
      }, 1500);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const msg =
        error.response?.data?.message || error.message || "Unknown error";
      form.update("hidden", false);
      form.update("status", "critical");
      form.update("message", msg);
      form.update("buttonMessage", "Register");
      form.update("buttonDisabled", false);
    },
  });

  useEffect(() => {
    SiteTitle({ title: "Register" });
    usernameRef.current?.focus();
  }, []);

  // 简单邮箱校验函数
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="flex flex-col items-center justify-center pt-9 gap-5">
      <Avatar size={100} src="/float.png" />
      <Heading>Create your FloatCTF account</Heading>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (
            !form.state.username ||
            !form.state.nickname ||
            !form.state.email ||
            !form.state.password ||
            !form.state.confirmPassword
          ) {
            form.update("hidden", false);
            form.update("status", "critical");
            form.update("message", "Please fill in all fields");
            return;
          }
          if (!validateEmail(form.state.email)) {
            form.update("hidden", false);
            form.update("status", "critical");
            form.update("message", "Invalid email format");
            return;
          }
          if (form.state.password !== form.state.confirmPassword) {
            form.update("hidden", false);
            form.update("status", "critical");
            form.update("message", "Passwords do not match");
            return;
          }
          mutation.mutate({
            username: form.state.username,
            password: form.state.password,
            nickname: form.state.nickname,
            email: form.state.email,
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
            value={form.state.username}
            placeholder="学号"
            onChange={(e) => form.update("username", e.target.value)}
          />
        </FormControl>

        <FormControl required>
          <FormControl.Label>Nickname</FormControl.Label>
          <TextInput
            className="w-full"
            name="nickname"
            placeholder="昵称"
            value={form.state.nickname}
            onChange={(e) => form.update("nickname", e.target.value)}
          />
        </FormControl>

        <FormControl required>
          <FormControl.Label>Email</FormControl.Label>
          <TextInput
            className="w-full"
            type="email"
            name="email"
            value={form.state.email}
            onChange={(e) => form.update("email", e.target.value)}
          />
        </FormControl>

        <FormControl required>
          <FormControl.Label>Password</FormControl.Label>
          <TextInput
            className="w-full"
            type="password"
            name="password"
            value={form.state.password}
            onChange={(e) => form.update("password", e.target.value)}
          />
        </FormControl>

        <FormControl required>
          <FormControl.Label>Confirm Password</FormControl.Label>
          <TextInput
            className="w-full"
            type="password"
            name="confirmPassword"
            value={form.state.confirmPassword}
            onChange={(e) => form.update("confirmPassword", e.target.value)}
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

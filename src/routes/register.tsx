import { userServiceApi } from "@/api/service";
import { Avatar, Button, FormControl, Heading, TextInput } from "@primer/react";
import { InlineMessage } from "@primer/react/experimental";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useReactive, useTitle } from "ahooks";
import type { AxiosError } from "axios";
import { useEffect, useRef } from "react";
import { ServiceRouteGuardWithRedirect } from "./service/route";

export const Route = createFileRoute("/register")({
  component: Register,
  loader: ServiceRouteGuardWithRedirect,
});

type MessageVariant = "critical" | "success" | "unavailable" | "warning";

function Register() {
  useTitle("Register | FloatCTF");
  const form = useReactive({
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
    mutationFn: userServiceApi.register,
    onMutate: () => {
      form.hidden = true;
      form.buttonMessage = "Registering...";
      form.buttonDisabled = true;
    },
    onSuccess: () => {
      form.hidden = false;
      form.status = "success";
      form.message;
      ("Registration successful! Redirecting to login...");
      form.buttonMessage = "Success";

      setTimeout(() => {
        navigate({ to: "/" });
      }, 1500);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const msg =
        error.response?.data?.message || error.message || "Unknown error";
      form.hidden = false;
      form.status = "critical";
      form.message = msg;

      form.buttonMessage = "Register";
      form.buttonDisabled = false;
    },
  });

  useEffect(() => {
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
            !form.username ||
            !form.nickname ||
            !form.email ||
            !form.password ||
            !form.confirmPassword
          ) {
            form.hidden = false;
            form.status = "critical";
            form.message = "Please fill in all fields";
            return;
          }
          if (!validateEmail(form.email)) {
            form.hidden = false;
            form.status = "critical";
            form.message = "Invalid email format";
            return;
          }
          if (form.password !== form.confirmPassword) {
            form.hidden = false;
            form.status = "critical";
            form.message = "Passwords do not match";
            return;
          }
          mutation.mutate({
            username: form.username,
            password: form.password,
            nickname: form.nickname,
            email: form.email,
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
            placeholder="学号"
            onChange={(e) => {
              form.username = e.target.value;
            }}
          />
        </FormControl>

        <FormControl required>
          <FormControl.Label>Nickname</FormControl.Label>
          <TextInput
            className="w-full"
            name="nickname"
            placeholder="昵称"
            value={form.nickname}
            onChange={(e) => {
              form.nickname = e.target.value;
            }}
          />
        </FormControl>

        <FormControl required>
          <FormControl.Label>Email</FormControl.Label>
          <TextInput
            className="w-full"
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => {
              form.email = e.target.value;
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

        <FormControl required>
          <FormControl.Label>Confirm Password</FormControl.Label>
          <TextInput
            className="w-full"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={(e) => {
              form.confirmPassword = e.target.value;
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

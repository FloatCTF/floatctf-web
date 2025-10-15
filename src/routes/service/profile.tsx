import { PencilIcon } from "@primer/octicons-react";
import { Button, FormControl, TextInput } from "@primer/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useReactive } from "ahooks";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";

import { serviceApi } from "@/api";
import { useMsgBanner } from "@/components";
import type { Users } from "@/entity";
import { diffToPatch } from "@/util";

export const Route = createFileRoute("/service/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const [editable, setEditable] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => serviceApi.users.getMe(),
    select: (res) => res.data,
  });

  const [originalProfile, setOriginalProfile] = useState<Partial<Users>>({});
  const banner = useMsgBanner();

  const mutationProfile = useReactive<Partial<Users>>({
    username: "",
    nickname: "",
    email: "",
    password: "",
  });

  const patchMutation = useMutation({
    mutationFn: serviceApi.users.patchMe,
    onSuccess: () => {
      setEditable(false);
      banner.showBanner("success", "Update profile successfully!");
    },
    onError: (e: AxiosError<{ msg: string }>) => {
      if (e.response?.data) {
        banner.showBanner("critical", e.response?.data.msg);
      }
    },
  });
  useEffect(() => {
    if (data) {
      Object.assign(mutationProfile, data);
      setOriginalProfile(data);
    }
  }, [data, mutationProfile]);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="px-3 w-full">
      <h3 className="border-bottom py-2  my-3">Profile</h3>
      <div className="flex flex-col gap-2">
        <FormControl>
          <FormControl.Label>Username</FormControl.Label>
          <TextInput
            value={mutationProfile.username}
            disabled={true}
            onChange={(e) => {
              mutationProfile.username = e.target.value;
            }}
          />
          <FormControl.Caption>
            This is can not mutate, or contact the administrator
          </FormControl.Caption>
        </FormControl>
        <FormControl>
          <FormControl.Label>Nickname</FormControl.Label>
          <TextInput
            value={mutationProfile.nickname}
            disabled={!editable}
            onChange={(e) => {
              mutationProfile.nickname = e.target.value;
            }}
          />
          <FormControl.Caption>
            The nickname will be displayed in the public area
          </FormControl.Caption>
        </FormControl>
        <FormControl>
          <FormControl.Label>Email</FormControl.Label>
          <TextInput
            value={mutationProfile.email}
            disabled={!editable}
            onChange={(e) => {
              mutationProfile.email = e.target.value;
            }}
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>Password</FormControl.Label>
          <TextInput
            value={mutationProfile.password}
            disabled={!editable}
            onChange={(e) => {
              mutationProfile.password = e.target.value;
            }}
          />
          <FormControl.Caption>Fill it</FormControl.Caption>
        </FormControl>
        {!editable && (
          <Button className="w-fit" onClick={() => setEditable(true)}>
            <PencilIcon />
            &emsp;Edit
          </Button>
        )}
        {editable && (
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => setEditable(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const payload = diffToPatch(originalProfile, mutationProfile);
                patchMutation.mutate(payload);
              }}
            >
              Save
            </Button>
          </div>
        )}
        <banner.BannerComponent />
      </div>
    </div>
  );
}

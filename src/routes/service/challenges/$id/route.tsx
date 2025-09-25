import { Spinner, UnderlineNav } from "@primer/react";
import { Outlet, createFileRoute } from "@tanstack/react-router";

import { challengeServiceApi } from "@/api/service";
import MDPlusEditor from "@/components/MDPlusEditor";
import type { BannerVariant } from "@/components/admin/Table";
import { useTypedState } from "@/lib";
import { Banner } from "@primer/react/experimental";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { RouterNavItem } from "../../events/$id/route";
import { ServiceRouteGuard } from "../../route";
export const Route = createFileRoute("/service/challenges/$id")({
  component: RouteComponent,
  loader: ServiceRouteGuard,
});
export type ChallengeWriteup = {
  id: string;
  challenge_id: string;
  user_id: string;

  content: string;
  created_at: string;
};
function RouteComponent() {
  const { id } = Route.useParams();
  const [markdown, setMarkdown] = useState<string>("");
  const { data: writeup, isLoading } = useQuery({
    queryKey: ["my-challenge-writeup", id],
    queryFn: () => challengeServiceApi.getMyWriteup(id),
  });

  const wpMutations = useMutation({
    mutationFn: challengeServiceApi.createMyWriteup,
    onSuccess: () => {
      mutationBanner.update("isShown", true);
      mutationBanner.update("description", "Writeup saved successfully");
      mutationBanner.update("variant", "success");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg =
        error.response?.data?.message || error.message || "Unknown error";

      mutationBanner.update("isShown", true);
      mutationBanner.update("description", msg);
      mutationBanner.update("variant", "critical");
    },
  });
  const mutationBanner = useTypedState({
    isShown: false,
    description: "Something here",
    variant: "info" as BannerVariant,
  });
  useEffect(() => {
    const data = writeup?.data;
    if (data?.content) {
      setMarkdown(data?.content);
    }
  }, [writeup]);

  return (
    <div className="flex h-full w-full flex-col">
      <UnderlineNav aria-label="Repository">
        <RouterNavItem to="/service/challenges/$id" params={{ id }}>
          Challenge
        </RouterNavItem>
        <RouterNavItem to="/service/challenges/$id/writeup" params={{ id }}>
          WriteUp
        </RouterNavItem>
        <RouterNavItem to="#" params={{ id }}>
          Discussion
        </RouterNavItem>
      </UnderlineNav>

      <div className="flex h-full w-full min-h-0">
        {/* 左侧 */}
        <div id="info" className="flex flex-col p-2 my-2 flex-5 min-h-0">
          <Outlet />
        </div>

        {/* 右侧 */}
        <div
          id="challenge-wp"
          className="flex-7 h-full flex flex-col min-h-0 border-l"
        >
          {mutationBanner.state.isShown && (
            <Banner
              title="title"
              hideTitle={true}
              description={mutationBanner.state.description}
              variant={mutationBanner.state.variant}
              className="m-2"
              onDismiss={() => {
                mutationBanner.update("isShown", false);
              }}
            />
          )}
          <MDPlusEditor
            className="flex-1 min-h-0"
            value={markdown}
            setValue={(value) => setMarkdown(value)}
            onSave={() => {
              wpMutations.mutate({ challenge_id: id, content: markdown });
            }}
          />
        </div>
      </div>
    </div>
  );
}

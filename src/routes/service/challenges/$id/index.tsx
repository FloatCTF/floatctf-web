import {
  challengeServiceApi,
  instanceServiceApi,
  submitServiceApi,
} from "@/api/service";
import type { BannerVariant } from "@/components/admin/Table";
import { useTypedState } from "@/lib";
import type { Instance } from "@/routes/admin/instances";
import { Button, ProgressBar, TextInput } from "@primer/react";
import { Banner } from "@primer/react/experimental";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect, useRef, useState } from "react";
dayjs.extend(utc);
export const Route = createFileRoute("/service/challenges/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const {
    data: challenge_data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => challengeServiceApi.get(id),
  });
  const mutationBanner = useTypedState({
    isShown: false,
    description: "Something here",
    variant: "info" as BannerVariant,
  });

  const challenge = challenge_data?.data;
  const challengeStatus = useTypedState({
    flag: "",
    isRunning: false,
    instance: {} as Instance,
  });

  const { data: instance_data, refetch: refetch_instance } = useQuery({
    queryKey: ["instance", id],
    queryFn: () => challengeServiceApi.getInstance(id),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (instance_data?.data) {
      challengeStatus.update("isRunning", true);
      challengeStatus.update("instance", instance_data.data);
    } else {
      challengeStatus.update("isRunning", false);
      challengeStatus.update("instance", {} as Instance);
    }
  }, [instance_data]);

  const mutationInstance = useMutation({
    mutationFn: instanceServiceApi.launch,
    onSuccess: (data) => {
      challengeStatus.update("isRunning", true);
      challengeStatus.update("instance", data.data!);
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
  const destroyInstance = useMutation({
    mutationFn: instanceServiceApi.destroy,
    onSuccess: (_data) => {
      challengeStatus.update("isRunning", false);
      challengeStatus.update("instance", {} as Instance);
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
  const submitFlag = useMutation({
    mutationFn: submitServiceApi.submit,
    onSuccess: (_data) => {
      mutationBanner.update("isShown", true);
      mutationBanner.update("description", "Flag submitted successfully");
      mutationBanner.update("variant", "success");
      // close in the backend
      challengeStatus.update("isRunning", false);
      challengeStatus.update("instance", {} as Instance);
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
  const navigate = useNavigate();

  if (isError) {
    navigate({ to: "/service/challenges" });
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full w-full flex flex-col gap-2 justify-between">
      <div id="challenge-meta" className="flex-6">
        <p className="font-bold text-2xl">{challenge?.name}</p>
        <div className="border-top mt-2 pt-2">{challenge?.description}</div>
      </div>

      {mutationBanner.state.isShown && (
        <Banner
          title="title"
          hideTitle={true}
          description={mutationBanner.state.description}
          variant={mutationBanner.state.variant}
          onDismiss={() => {
            mutationBanner.update("isShown", false);
          }}
        />
      )}
      {challengeStatus.state.instance && (
        <div>{challengeStatus.state.instance.content}</div>
      )}

      <div
        id="challenge-content"
        className="mb-4 flex justify-center flex-1 border-bottom"
      >
        {challengeStatus.state.isRunning ? (
          <div className="w-full flex flex-col gap-2 mb-4">
            <RemainingTimer
              destroy_at={challengeStatus.state.instance.destroy_at}
              onExpire={() => {
                destroyInstance.mutate(challengeStatus.state.instance.id);
              }}
            />

            <div className="flex gap-2">
              <TextInput
                className="flex-1"
                value={challengeStatus.state.flag}
                onChange={(e) => {
                  challengeStatus.update("flag", e.target.value);
                }}
                placeholder="flag{}"
              />
              <Button
                variant="danger"
                onClick={() => {
                  destroyInstance.mutate(challengeStatus.state.instance.id);
                }}
              >
                Destroy
              </Button>

              <Button
                variant="primary"
                onClick={() => {
                  submitFlag.mutate({
                    instance_id: challengeStatus.state.instance.id,
                    flag: challengeStatus.state.flag,
                  });
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={() => {
              mutationInstance.mutate(id);
            }}
          >
            Launch
          </Button>
        )}
      </div>
    </div>
  );
}

type RemainingTimerProps = {
  destroy_at: string;
  totalMinutes?: number;
  onExpire?: () => void;
};

export const RemainingTimer = ({
  destroy_at,
  totalMinutes = 60,
  onExpire,
}: RemainingTimerProps) => {
  const [remaining, setRemaining] = useState({
    formatted: "",
    percentage: 100,
  });

  // ✅ 防止 onExpire 重复调用
  const expiredRef = useRef(false);

  useEffect(() => {
    const update = () => {
      const destroyTime = dayjs.utc(destroy_at).toDate();
      const diffSeconds = Math.floor(
        (destroyTime.getTime() - Date.now()) / 1000
      );

      const safeDiff = Math.max(diffSeconds, 0);
      const minutes = Math.floor(safeDiff / 60);
      const seconds = safeDiff % 60;
      // ✅ <= 0 确保不会错过触发点
      setRemaining({
        formatted: `${minutes}m ${seconds}s`,
        percentage: Math.max(
          Math.min((safeDiff / (totalMinutes * 60)) * 100, 100),
          0
        ),
      });

      if (safeDiff <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        console.log("🔥 Expired, calling onExpire()");
        onExpire?.();
      }
    };

    update(); // 初始化跑一次
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [destroy_at, totalMinutes, onExpire]);

  return (
    <>
      <span
        style={{
          color: "var(--fgColor-muted)",
          font: "var(--text-body-shorthand-medium)",
        }}
        className="text-center"
      >
        Remaining: {remaining.formatted}
      </span>
      <ProgressBar
        animated
        progress={remaining.percentage}
        aria-label="remaining"
      />
    </>
  );
};

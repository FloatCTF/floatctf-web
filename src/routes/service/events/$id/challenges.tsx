import {
  eventServiceApi,
  instanceServiceApi,
  submitServiceApi,
} from "@/api/service";
import type { BannerVariant } from "@/components/admin/Table";
import { useTypedState } from "@/lib";
import type { Challenge } from "@/routes/admin/challenges";
import type { Instance } from "@/routes/admin/instances";
import { CheckIcon } from "@primer/octicons-react";
import { Button, Label, TextInput } from "@primer/react";
import { Banner, DataTable, Dialog, Table } from "@primer/react/experimental";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { AxiosError } from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useCallback, useEffect } from "react";
import { RemainingTimer } from "../../challenges/$id";
dayjs.extend(utc);
export const Route = createFileRoute("/service/events/$id/challenges")({
  component: RouteComponent,
});

export type EventChallengeResult = {
  id: string;
  challenge: Challenge;
  current_points: number;
  solved_count: number;
  solved: boolean;
};

function RouteComponent() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["eventChallenges", id],
    queryFn: () => eventServiceApi.fetchChallenges(id),
  });

  const challengeDialog = useTypedState({
    open: false,
    title: "",
    event_challenge_result: {} as EventChallengeResult,
  });

  const handleClose = useCallback(() => {
    challengeDialog.update("open", false);
  }, [challengeDialog]);

  const columns = [
    {
      accessorKey: "challenge.name",
      header: "Name",
      field: "challenge.name",
      rowHeader: true,
      renderCell: (row: EventChallengeResult) => {
        return (
          <button
            type="button"
            onClick={() => {
              challengeDialog.update("title", row.challenge.name);
              challengeDialog.update("event_challenge_result", row);
              challengeDialog.update("open", true);
            }}
            className="bg-transparent border-none p-0 m-0 text-blue-600 hover:underline cursor-pointer"
          >
            {row.challenge.name}
          </button>
        );
      },
    },

    {
      accessorKey: "current_points",
      header: "Points",
      field: "current_points",
      renderCell: (row: EventChallengeResult) => {
        return <span className="font-bold">{row.current_points}</span>;
      },
      sortBy: true,
    },
    {
      accessorKey: "challenge.category",
      header: "Category",
      field: "challenge.category",
      sortBy: "alphanumeric",
    },
    {
      accessorKey: "solved_count",
      header: "Solved Count",
      field: "solved_count",
      sortBy: true,
    },
    {
      accessorKey: "solved",
      header: "Solved",
      field: "solved",
      renderCell: (row: EventChallengeResult) => (
        <span>{row.solved ? <CheckIcon /> : <></>}</span>
        // 是否为一血
      ),
      sortBy: true,
    },
  ];
  const table = useReactTable({
    data: data?.data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Event has not been started</div>;
  }

  return (
    <Table.Container className="m-2">
      <DataTable
        aria-labelledby="repositories-default"
        // @ts-ignore
        columns={columns}
        data={table.getRowModel().rows.map((row) => row.original)}
      />
      <ChallengeDialog
        open={challengeDialog.state.open}
        title={challengeDialog.state.title}
        event_challenge_result={challengeDialog.state.event_challenge_result}
        onClose={handleClose}
        eventId={id}
      />
    </Table.Container>
  );
}
type ChallengeDialogProps = {
  open: boolean;
  title: string;
  event_challenge_result: EventChallengeResult | null;
  onClose: () => void;
  eventId: string;
};

function ChallengeDialog({
  open,
  title,
  event_challenge_result,
  onClose,
  eventId,
}: ChallengeDialogProps) {
  const challenge = event_challenge_result?.challenge;

  const challengeStatus = useTypedState({
    isRunning: false,
    instance: {} as Instance,
    flag: "",
  });
  // 拉取现有 instance
  const { data: instance_data, refetch: refetch_instance } = useQuery({
    queryKey: ["event_instance", challenge?.id],
    queryFn: () =>
      eventServiceApi.getChallengeInstance(eventId, challenge?.id ?? ""),
    enabled: open && !!challenge?.id,
  });

  // useEffect 只在 instance_data 更新时执行一次
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (open) {
      if (instance_data?.data) {
        challengeStatus.update("isRunning", true);
        challengeStatus.update("instance", instance_data.data);
      } else {
        challengeStatus.update("isRunning", false);
        challengeStatus.update("instance", {} as Instance);
      }
    }
  }, [instance_data, open]);
  const mutationBanner = useTypedState({
    isShown: false,
    description: "Something here",
    variant: "info" as BannerVariant,
  });
  // Launch mutation
  const launchMutation = useMutation({
    mutationFn: (challenge_id: string) =>
      eventServiceApi.launchSingleInstance(eventId, challenge_id),
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
    mutationFn: submitServiceApi.submitSingle,
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

  if (!open) return null;

  return (
    <Dialog
      title={challenge?.name ?? title}
      onClose={onClose}
      className="max-w-lg"
    >
      <div className="flex flex-col gap-2 text-sm text-gray-800">
        {/* 状态信息 */}
        <div className="flex flex-wrap gap-4">
          <div>
            <span className="font-semibold">Current Score:</span>{" "}
            {event_challenge_result?.current_points ?? "-"}
          </div>
          <div>
            <span className="font-semibold">Solved Count:</span>{" "}
            {event_challenge_result?.solved_count ?? "-"}
          </div>
          <div>
            <span className="font-semibold">Solved:</span>{" "}
            {event_challenge_result?.solved ? "✅" : "❌"}
          </div>
        </div>

        {/* 题目信息 */}
        <p>{challenge?.description}</p>

        {/* 附件 */}
        {challenge?.attachment && (
          <a
            href={`/challenges/${challenge.name}/${challenge.attachment}`}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-1"
          >
            <Label variant="accent">{challenge.attachment}</Label>
          </a>
        )}

        {/* Instance 控制 */}
        <div className="mt-2 ">
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
          {challengeStatus.state.instance && (
            <div>{challengeStatus.state.instance.content}</div>
          )}
          {challengeStatus.state.isRunning ? (
            <div className="w-full flex flex-col gap-2 mb-4">
              <RemainingTimer
                destroy_at={challengeStatus.state.instance.destroy_at}
                onExpire={() => {
                  refetch_instance({ cancelRefetch: true });
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
                      event_id: eventId,
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
              onClick={() => launchMutation.mutate(challenge?.id ?? "")}
            >
              Launch
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}

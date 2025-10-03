import { challengeAdminApi } from "@/api/admin";
import {
  challengeServiceApi,
  instanceServiceApi,
  submitServiceApi,
} from "@/api/service";
import { useMsgBanner } from "@/components/MsgBanner";
import { GenericTable } from "@/components/admin/Table";
import type { Challenge } from "@/routes/admin/challenges";
import type { Instance } from "@/routes/admin/instances";
import { Button, Dialog, Label, TextInput } from "@primer/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useReactive } from "ahooks";
import type { AxiosError } from "axios";
import { useCallback, useEffect } from "react";
import { RemainingTimer } from "../../challenges/$id";

export const Route = createFileRoute("/service/challenge_sets/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const subject = `Challenge Set #${id}`;
  const challengeDialog = useReactive({
    open: false,
    title: "",
    challenge_id: "",
  });
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      field: "id",
      rowHeader: true,
      renderCell: (row: Challenge) => {
        return (
          <button
            type="button"
            onClick={() => {
              challengeDialog.open = true;
              challengeDialog.title = row.name;
              challengeDialog.challenge_id = row.id;
            }}
            className="bg-transparent border-none p-0 m-0 text-blue-600 hover:underline cursor-pointer"
          >
            {row.id}
          </button>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      field: "name",
      sortBy: true,
      renderCell: (row: Challenge) => {
        return (
          <button
            type="button"
            onClick={() => {
              challengeDialog.open = true;
              challengeDialog.title = row.name;
              challengeDialog.challenge_id = row.id;
            }}
            className="bg-transparent border-none p-0 m-0 text-blue-600 hover:underline cursor-pointer"
          >
            {row.name}
          </button>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      field: "category",
      sortBy: true,
    },
  ];

  const handleClose = useCallback(() => {
    challengeDialog.open = false;
  }, [challengeDialog]);

  return (
    <div>
      <GenericTable
        subject={subject}
        columns={columns}
        queryFn={() => challengeServiceApi.getChallengeSet(id)}
        disablePagination={true}
        disableAdd={true}
        enableInternalActions={false}
      />{" "}
      <ChallengeDialog
        open={challengeDialog.open}
        title={challengeDialog.title}
        onClose={handleClose}
        id={challengeDialog.challenge_id}
      />
    </div>
  );
}
type ChallengeDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  id: string;
};

function ChallengeDialog({ open, title, onClose, id }: ChallengeDialogProps) {
  const { data: challenge } = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => challengeServiceApi.get(id),
    select: (data) => data.data,
  });

  const challengeStatus = useReactive({
    isRunning: false,
    instance: {} as Instance,
    flag: "",
  });
  // 拉取现有 instance

  const { data: instance_data, refetch: refetch_instance } = useQuery({
    queryKey: ["instance", id],
    queryFn: () => challengeServiceApi.getInstance(id),
  });

  // useEffect 只在 instance_data 更新时执行一次
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (open) {
      if (instance_data?.data) {
        challengeStatus.isRunning = true;
        challengeStatus.instance = instance_data.data;
      } else {
        challengeStatus.isRunning = false;
        challengeStatus.instance = {} as Instance;
      }
    }
  }, [instance_data, open]);
  const banner = useMsgBanner();
  // Launch mutation
  const mutationInstance = useMutation({
    mutationFn: instanceServiceApi.launch,
    onSuccess: (data) => {
      challengeStatus.isRunning = true;
      challengeStatus.instance = data.data!;
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg =
        error.response?.data?.message || error.message || "Unknown error";
      banner.showBanner("critical", msg);
    },
  });
  const destroyInstance = useMutation({
    mutationFn: instanceServiceApi.destroy,
    onSuccess: (_data) => {
      challengeStatus.isRunning = false;
      challengeStatus.instance = {} as Instance;
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg =
        error.response?.data?.message || error.message || "Unknown error";

      banner.showBanner("critical", msg);
    },
  });
  const submitFlag = useMutation({
    mutationFn: submitServiceApi.submit,
    onSuccess: (_data) => {
      banner.showBanner("success", "Flag is correct!");
      // close in the backend
      challengeStatus.isRunning = false;
      challengeStatus.instance = {} as Instance;
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg =
        error.response?.data?.message || error.message || "Unknown error";
      banner.showBanner("critical", msg);
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
        {/* 题目信息 */}
        <p>{challenge?.description}</p>

        {/* 附件 */}
        {challenge?.attachment && (
          <a
            href={`/challenges/${challenge.safe_name}/${challenge.attachment}`}
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
          <banner.BannerComponent />
          {challengeStatus.instance && (
            <div
              // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
              dangerouslySetInnerHTML={{
                __html: challengeStatus.instance.content || "",
              }}
            />
          )}
          {challengeStatus.isRunning ? (
            <div className="w-full flex flex-col gap-2 mb-4">
              <RemainingTimer
                destroy_at={challengeStatus.instance.destroy_at}
                onExpire={() => {
                  refetch_instance({ cancelRefetch: true });
                  destroyInstance.mutate(challengeStatus.instance.id);
                }}
              />

              <div className="flex gap-2">
                <TextInput
                  className="flex-1"
                  value={challengeStatus.flag}
                  onChange={(e) => {
                    challengeStatus.flag = e.target.value;
                  }}
                  placeholder="flag{}"
                />
                <Button
                  variant="danger"
                  onClick={() => {
                    destroyInstance.mutate(challengeStatus.instance.id);
                  }}
                >
                  Destroy
                </Button>

                <Button
                  variant="primary"
                  onClick={() => {
                    submitFlag.mutate({
                      instance_id: challengeStatus.instance.id,
                      flag: challengeStatus.flag,
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
              onClick={() => mutationInstance.mutate(id)}
            >
              Launch
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}

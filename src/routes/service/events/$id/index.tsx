import { eventServiceApi, submitServiceApi } from "@/api/service";
import { useTypedState } from "@/lib";
import { Button, FormControl, Heading, Label, TextInput } from "@primer/react";
import { InlineMessage } from "@primer/react/experimental";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import dayjs from "dayjs";
import { type FormEvent, useMemo, useRef, useState } from "react";
import type { EventInfo } from "..";

export const Route = createFileRoute("/service/events/$id/")({
  component: RouteComponent,
});

type EventCore = {
  id: string;
  title: string;
  type: "JeopardySingle" | "JeopardyTeam" | string;
  start_time?: string; // ISO8601
  end_time?: string; // ISO8601
  description?: string;
  rules?: string; // "<>" 分隔
};

export type EventTeam = {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  points: number;
  banned: boolean;
};

function parseMs(iso?: string): number {
  if (!iso) return Number.NaN;
  return dayjs.utc(iso).valueOf(); // 始终按 UTC 解析
}

function getEventStatus(
  startISO?: string,
  endISO?: string,
  nowMs = Date.now()
) {
  const s = parseMs(startISO);
  const e = parseMs(endISO);
  if (Number.isNaN(s) || Number.isNaN(e)) return "unknown" as const;
  if (s > nowMs) return "upcoming" as const;
  if (e < nowMs) return "ended" as const;
  return "ongoing" as const;
}

function formatDate(iso?: string) {
  return dayjs.utc(iso).local().format("YYYY-MM-DD HH:mm:ss");
}

function RouteComponent() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();

  const msg = useTypedState({
    hidden: true,
    message: "",
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventServiceApi.get(id),
  });

  const eventData: EventInfo | undefined = data?.data;
  const ev = eventData?.event;

  const status = useMemo(
    () => getEventStatus(ev?.start_time, ev?.end_time),
    [ev?.start_time, ev?.end_time]
  );

  const showStatusText =
    status === "upcoming"
      ? "Upcoming"
      : status === "ended"
      ? "Ended"
      : status === "ongoing"
      ? "Ongoing"
      : "TBD";

  // 统一命名 join/leave mutation；把隐藏消息放到 onMutate（清空）和 onError（展示）
  const joinEventMutation = useMutation({
    mutationFn: eventServiceApi.join,
    onMutate: () => {
      msg.update("hidden", true);
      msg.update("message", "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },

    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg1 =
        error.response?.data?.message || error.message || "Unknown error";

      msg.update("hidden", false);
      msg.update("message", msg1);
    },
  });

  const leaveEventMutation = useMutation({
    mutationFn: eventServiceApi.leave,
    onMutate: () => {
      msg.update("hidden", true);
      msg.update("message", "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },

    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg1 =
        error.response?.data?.message || error.message || "Unknown error";

      msg.update("hidden", false);
      msg.update("message", msg1);
    },
  });

  // Team 表单状态（占位实现）
  const [teamId, setTeamId] = useState("");
  const [teamName, setTeamName] = useState("");
  const createEventTeamMutation = useMutation({
    mutationFn: eventServiceApi.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      // join success
    },

    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg1 =
        error.response?.data?.message || error.message || "Unknown error";

      msg.update("hidden", false);
      msg.update("message", msg1);
    },
  });
  const quitEventTeamMutation = useMutation({
    mutationFn: eventServiceApi.quitTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },

    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg1 =
        error.response?.data?.message || error.message || "Unknown error";

      msg.update("hidden", false);
      msg.update("message", msg1);
    },
  });
  const handleJoinSingle = () => {
    if (!ev) return;
    joinEventMutation.mutate(ev.id);
  };
  const handleLeaveSingle = () => {
    if (!ev) return;
    leaveEventMutation.mutate(ev.id);
  };

  const isJoining = joinEventMutation.isPending;
  const isLeaving =
    leaveEventMutation.isPending || quitEventTeamMutation.isPending;

  if (isLoading) {
    return <div className="p-4">Loading…</div>;
  }
  if (isError) {
    return (
      <div className="p-4">
        <InlineMessage variant="critical">
          {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
          {(error as any)?.message ?? "Failed to load event."}
        </InlineMessage>
      </div>
    );
  }
  if (!eventData || !ev) {
    return (
      <div className="p-4">
        <InlineMessage variant="warning">Event not found.</InlineMessage>
      </div>
    );
  }

  return (
    <div className="flex p-4 w-full gap-32">
      {/* 左侧：详情 */}
      <div className="flex flex-col gap-3">
        <section className="p-3 rounded border">
          <div className="flex items-center gap-2 mb-2">
            <Heading as="h2">{ev.title}</Heading>
            {eventData.joined ? (
              <Label variant="success">Joined</Label>
            ) : (
              <Label variant="attention">Unjoined</Label>
            )}
          </div>

          {/* 用 <dl> 语义化描述列表，替代 div+tr/td 混用 */}
          <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2">
            <dt className="font-bold">ID</dt>
            <dd className="font-medium break-all">{ev.id}</dd>

            <dt className="font-bold">Type</dt>
            <dd className="font-medium">{ev.type}</dd>

            <dt className="font-bold">Start</dt>
            <dd className="font-medium">{formatDate(ev.start_time)}</dd>

            <dt className="font-bold">End</dt>
            <dd className="font-medium">{formatDate(ev.end_time)}</dd>

            <dt className="font-bold">Status</dt>
            <dd className="font-medium">{showStatusText}</dd>

            <dt className="font-bold">Description</dt>
            <dd className="font-medium whitespace-pre-wrap">
              {ev.description || "-"}
            </dd>
          </dl>
        </section>

        {ev.rules && (
          <section className="p-3 rounded border">
            <Heading sx={{ fontSize: 2, mb: 2 }}>Rules</Heading>
            <ul className="list-decimal list-inside space-y-1">
              {ev.rules.split("<>").map((rule, idx) => (
                <li key={`${rule}-${idx}`.slice(0, 64)}>{rule}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* 右侧：操作 */}
      <div className="flex flex-col gap-3 min-w-[320px]">
        {ev.type === "JeopardySingle" && (
          <section className="p-3 rounded border flex items-center min-h-[72px]">
            {status === "upcoming" ? (
              eventData.joined ? (
                <Button
                  className="w-28"
                  variant="danger"
                  onClick={handleLeaveSingle}
                  disabled={isLeaving}
                  aria-label="Leave event"
                >
                  {isLeaving ? "Leaving…" : "Leave"}
                </Button>
              ) : (
                <Button
                  className="w-28"
                  variant="primary"
                  onClick={handleJoinSingle}
                  disabled={isJoining}
                  aria-label="Join event"
                >
                  {isJoining ? "Joining…" : "Join"}
                </Button>
              )
            ) : status === "ended" && eventData.joined ? (
              <SubmitWriteup eventId={id} />
            ) : status === "ongoing" && eventData.joined ? (
              <SubmitWriteup eventId={id} />
            ) : (
              <span className="text-muted-foreground">TBD</span>
            )}
          </section>
        )}

        {ev.type === "JeopardyTeam" && (
          <section className="p-3 rounded border flex gap-5">
            {status === "upcoming" && eventData.joined && (
              <Button
                className="w-28"
                variant="danger"
                onClick={() =>
                  quitEventTeamMutation.mutate({
                    event_id: id,
                    team_id: eventData.team?.id ?? "",
                  })
                }
                disabled={isLeaving}
                aria-label="Leave event"
              >
                {isLeaving ? "Leaving…" : "Leave"}
              </Button>
            )}
            {status === "upcoming" && !eventData.joined && (
              <>
                <form
                  className="flex w-full flex-col gap-2"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    // TODO: 调用 team join API 先正常join team 成功再join event
                    msg.update("hidden", false);
                    msg.update(
                      "message",
                      `Join team by ID: ${teamId} (not implemented)`
                    );
                  }}
                >
                  <FormControl required>
                    <FormControl.Label>Team ID</FormControl.Label>
                    <TextInput
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value)}
                      aria-label="Team ID"
                    />
                  </FormControl>
                  <Button variant="primary" type="submit">
                    Join
                  </Button>
                </form>
                <form
                  className="flex w-full flex-col gap-2"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    createEventTeamMutation.mutate({
                      event_id: id,
                      name: teamName,
                    });
                    msg.update("hidden", false);
                    msg.update(
                      "message",
                      `Create team: ${teamName} (not implemented)`
                    );
                  }}
                >
                  <FormControl required>
                    <FormControl.Label>Team Name</FormControl.Label>
                    <TextInput
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      aria-label="Team Name"
                    />
                  </FormControl>
                  <Button variant="primary" type="submit">
                    Create
                  </Button>
                </form>
              </>
            )}
          </section>
        )}

        {!msg.state.hidden && (
          <InlineMessage variant="critical">{msg.state.message}</InlineMessage>
        )}
      </div>
      <Announcements eventId={id} />
    </div>
  );
}
export type Announcement = {
  id: string;
  event_id: string;
  title: string;
  content: string;
  created_at: string;
};

function Announcements({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["announcements", eventId],
    queryFn: () => eventServiceApi.getAnnouncements(eventId),
    refetchInterval: 1000 * 60, // 1 min
  });

  if (isLoading) {
    return <div className="p-4">Loading…</div>;
  }
  if (isError) {
    return (
      <div className="p-4">
        <InlineMessage variant="critical">
          {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
          {(error as any)?.message ?? "Failed to load announcements."}
        </InlineMessage>
      </div>
    );
  }
  if (!data?.data) {
    return (
      <div className="p-4">
        <InlineMessage variant="warning">No announcements.</InlineMessage>
      </div>
    );
  }

  return (
    <div className="w-fit flex flex-col gap-3">
      {data.data.map((announcement) => (
        <section key={announcement.id} className="p-3 rounded border">
          <h3>{announcement.title}</h3>
          <p>{announcement.content}</p>
        </section>
      ))}
    </div>
  );
}
function SubmitWriteup({
  eventId,
  teamId,
}: {
  eventId: string;
  teamId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<null | {
    type: "success" | "error";
    text: string;
  }>(null);
  const queryClient = useQueryClient();
  const { data: createdDate } = useQuery({
    queryKey: ["writeup_created_date", eventId],
    queryFn: () => eventServiceApi.getWriteUpCreatedDate(eventId),
  });

  const submitMutation = useMutation({
    mutationFn: (file: File) =>
      submitServiceApi.submitWriteup(file, eventId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Challenges"] });
      setMessage({ type: "success", text: "提交成功 🎉" });
      setFile(null);
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (e) => {
      setMessage({ type: "error", text: "提交失败，请重试" });
      console.error("submit writeup error", e);
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // 只允许 docx
    if (!selected.name.toLowerCase().endsWith(".docx")) {
      setMessage({ type: "error", text: "只支持 DOCX 文件" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setFile(selected);
    e.target.value = ""; // 允许连续选择同一个文件
  };

  const handleUpload = () => {
    if (!file) return;
    submitMutation.mutate(file);
  };

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span
          className={`ml-2 text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {message.text}
        </span>
      )}
      {file && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{file.name}</span>
          <Button
            onClick={handleUpload}
            disabled={submitMutation.isPending}
            variant="primary"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit WP"}
          </Button>
        </div>
      )}
      <div>
        <Button onClick={handleClick}>Upload Writeup</Button>
        <p>Upload again to override the file</p>
        {createdDate?.data && (
          <p className="text-bold">
            Last uploaded at:{" "}
            {dayjs.utc(createdDate.data).local().format("YYYY-MM-DD HH:mm:ss")}
          </p>
        )}
        <input
          type="file"
          accept=".docx"
          ref={inputRef}
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

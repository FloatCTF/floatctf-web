import { Spinner } from "@primer/react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import MDEditor from "@uiw/react-md-editor";
import { useTitle } from "ahooks";

import { serviceApi } from "@/api";
import { DatetimeToShow } from "@/util";

export const Route = createFileRoute("/service/writeups/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["writeup", id],
    queryFn: () => serviceApi.challenges.getWriteup(id),
  });
  const writeup = data?.data;
  useTitle(`${writeup?.challenge.name ?? "Writeup"} | FloatCTF`);
  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <div className="text-red-500">加载失败，请稍后重试</div>;
  }

  return (
    <div className="h-full ">
      <div className="flex flex-col pt-3 px-8 gap-2">
        <h2 className=" flex justify-between">
          {writeup?.writeup.challenge_id && (
            <Link
              className="hover:underline"
              to="/service/challenges/$id"
              params={{ id: writeup.writeup.challenge_id }}
            >
              {writeup?.challenge.category} / {writeup?.challenge.name}
            </Link>
          )}
          {writeup?.nickname}
        </h2>

        <div className="flex justify-between">
          <span>
            Created at{" "}
            <span className="text-bold">
              {DatetimeToShow(writeup?.writeup.created_at)}
            </span>
          </span>
          <div>
            <span className="text-bold">{writeup?.email}</span>
          </div>
        </div>

        <div className="border-top mb-3" />

        <MDEditor.Markdown source={writeup?.writeup.content} />
      </div>
    </div>
  );
}

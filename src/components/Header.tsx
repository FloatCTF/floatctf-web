import { userServiceApi } from "@/api/service";
import { useAuthStore } from "@/stores/AuthStore";
import { Button } from "@primer/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default (props: React.HTMLAttributes<HTMLDivElement>) => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userServiceApi.getMe(),
  });
  const profile = data?.data;

  useEffect(() => {
    if (profile && authStore.nickname !== profile.nickname) {
      // 仅当 profile 加载完成 且 不同于当前值 时才更新 store
      authStore.setNickname(profile.nickname);
    }
  }, [profile, authStore]);
  if (isLoading) {
    return <></>;
  }
  return (
    <header
      className="
                bgColor-muted border-bottom
                d-flex flex-items-center p-2 justify-between
            "
      {...props}
    >
      <h3
        className="hover:cursor-pointer"
        onClick={() => {
          navigate({ to: "/" });
        }}
        onKeyUp={() => {}}
      >
        FloatCTF
      </h3>

      <div className="flex justify-center items-center gap-2">
        <span>
          {authStore.username}
          {authStore.nickname && <span>:{authStore.nickname}</span>}
        </span>
        <Button
          variant="danger"
          onClick={() => {
            authStore.removeToken();
            navigate({ to: "/" });
          }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

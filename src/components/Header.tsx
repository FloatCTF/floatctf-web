import { userServiceApi } from "@/api/service";
import { useAuthStore } from "@/stores/AuthStore";
import { Button } from "@primer/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export interface GenericHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  homePath: string;
  showUserInfo?: boolean;
  userProfilePath?: string;
  useProfileQuery?: boolean;
  onLogout: () => void;
}

export const GenericHeader = ({
  title,
  homePath,
  showUserInfo = false,
  useProfileQuery = false,
  userProfilePath = "/service/profile",
  onLogout,
  ...props
}: GenericHeaderProps) => {
  const authStore = useAuthStore();
  const navigate = useNavigate();

  // 如果需要加载用户信息
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userServiceApi.getMe(),
    enabled: useProfileQuery, // 控制是否启用
  });

  const profile = data?.data;

  // 同步 profile 的 nickname 到全局 store
  useEffect(() => {
    if (useProfileQuery && profile && authStore.nickname !== profile.nickname) {
      authStore.setNickname(profile.nickname);
    }
  }, [profile, authStore, useProfileQuery]);

  // 点击标题回到 home
  const handleGoHome = () => {
    navigate({ to: homePath });
  };

  if (useProfileQuery && isLoading) {
    return <></>; // 也可以替换成 loading spinner
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
        onClick={handleGoHome}
        onKeyUp={(e) => e.key === "Enter" && handleGoHome()}
      >
        {title}
      </h3>

      {showUserInfo ? (
        <div className="flex justify-center items-center gap-2">
          <span
            className="hover:cursor-pointer hover:underline"
            onKeyUp={(e) => e.key === "Enter" && handleGoHome()}
            onClick={() => navigate({ to: userProfilePath })}
          >
            {authStore.username}
            {authStore.nickname && <span>:{authStore.nickname}</span>}
          </span>
          <Button variant="danger" onClick={onLogout}>
            Logout
          </Button>
        </div>
      ) : (
        <Button variant="danger" onClick={onLogout}>
          Logout
        </Button>
      )}
    </header>
  );
};

export const ServiceHeader = () => {
  const authStore = useAuthStore();
  const navigate = useNavigate();

  return (
    <GenericHeader
      title="FloatCTF"
      homePath="/"
      showUserInfo
      useProfileQuery
      onLogout={() => {
        authStore.removeToken();
        navigate({ to: "/" });
      }}
    />
  );
};
export const AdminHeader = () => {
  const authStore = useAuthStore();
  const navigate = useNavigate();

  return (
    <GenericHeader
      title="FloatCTF Admin" // 管理后台标题
      homePath="/admin" // 点击标题返回的路径
      showUserInfo={false} // 管理后台通常不显示用户信息
      useProfileQuery={false} // 管理后台不需要加载普通用户 profile
      onLogout={() => {
        authStore.removeAdminToken();
        navigate({ to: "/admin" }); // 退出后返回后台首页或登录页
      }}
    />
  );
};

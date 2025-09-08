import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { useAuthStore } from "@/stores/AuthStore";
import {
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from "@tanstack/react-router";

export const Route = createFileRoute("/service")({
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();

  const hideSidebarPatterns = [/^\/service\/events\/.+/];
  const shouldHideSidebar = hideSidebarPatterns.some((pattern) =>
    pattern.test(location.pathname)
  );
  return (
    <div className="h-full w-full flex flex-col">
      <Header />
      <div className="flex flex-row  h-full ">
        {!shouldHideSidebar && ( // 👈 在这里判断
          <div className="border-right h-full pl-2 w-fit">
            <SideBar />
          </div>
        )}
        <div className="w-full h-full flex-1 p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
export const ServiceRouteGuard = async () => {
  const authStore = useAuthStore.getState();
  if (!authStore.token) {
    return redirect({ to: "/" });
  }
};

export const ServiceRouteGuardWithRedirect = async () => {
  const authStore = useAuthStore.getState();
  if (authStore.token) {
    return redirect({ to: "/service/top" });
  }
};

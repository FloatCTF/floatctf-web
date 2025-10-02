import SiteTitle from "@/components/SiteTitle";
import AdminHeader from "@/components/admin/Header";
import AdminSideBar from "@/components/admin/SideBar";
import { admin_ignore_routes } from "@/routes";
import { useAuthStore } from "@/stores/AuthStore";

import {
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  // loader: AdminRouteGuard,
});

function RouteComponent() {
  const location = useLocation();
  useEffect(() => {
    SiteTitle({ title: "Admin " });
  });
  if (admin_ignore_routes.includes(location.pathname)) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader />

      <div className="flex flex-row  h-full ">
        <div className="border-right h-full  pl-2 w-fit">
          <AdminSideBar />
        </div>
        <div className="p-2 w-full flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
export const AdminRouteGuard = async () => {
  const authStore = useAuthStore.getState();
  if (!authStore.adminToken) {
    return redirect({ to: "/admin" });
  }
};

export const AdminRouteGuardWithRedirect = async () => {
  const authStore = useAuthStore.getState();
  if (authStore.adminToken) {
    return redirect({ to: "/admin/dashboard" });
  }
};

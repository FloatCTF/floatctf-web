import { useAuthStore } from "@/stores/AuthStore";
import { Button } from "@primer/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default (props: React.HTMLAttributes<HTMLDivElement>) => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  return (
    <header
      className="
                bgColor-muted border-bottom
                d-flex flex-items-center p-2 justify-between
            "
      {...props}
    >
      <h2>FloatCTF Admin</h2>
      <Button
        variant="danger"
        onClick={() => {
          authStore.removeAdminToken();
          navigate({ to: "/admin" });
        }}
      >
        Logout
      </Button>
    </header>
  );
};

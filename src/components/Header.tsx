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
      <h3>FloatCTF </h3>

      <div className="flex justify-center items-center gap-2">
        <span>{authStore.username}</span>
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

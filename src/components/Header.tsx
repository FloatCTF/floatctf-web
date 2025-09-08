import { useAuthStore } from "@/stores/AuthStore";
import { Avatar, Button } from "@primer/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default (props: React.HTMLAttributes<HTMLDivElement>) => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    // set title
    document.title = "FloatCTF";
  });
  return (
    <header
      className="
                bgColor-muted border-bottom
                d-flex flex-items-center p-2 justify-between
            "
      {...props}
    >
      <h3>FloatCTF </h3>

      <Button
        variant="danger"
        onClick={() => {
          authStore.removeToken();
          navigate({ to: "/" });
        }}
      >
        Logout
      </Button>
    </header>
  );
};

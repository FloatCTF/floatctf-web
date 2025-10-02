import { Banner } from "@primer/react/experimental";
import { useReactive } from "ahooks";

export type BannerVariant =
  | "critical"
  | "info"
  | "success"
  | "upsell"
  | "warning";

export interface UseMsgBannerOptions {
  isShown?: boolean; // 是否默认显示
  description?: string; // 默认描述
  variant?: BannerVariant; // 默认类型
}

export function useMsgBanner(options: UseMsgBannerOptions = {}) {
  // 用传入的初始值覆盖默认值
  const mutationBanner = useReactive({
    isShown: options.isShown ?? false,
    description: options.description ?? "Something here",
    variant: options.variant ?? ("info" as BannerVariant),
  });

  const showBanner = (variant: BannerVariant, description: string) => {
    mutationBanner.isShown = true;
    mutationBanner.variant = variant;
    mutationBanner.description = description;
  };

  const hideBanner = () => {
    mutationBanner.isShown = false;
  };

  const BannerComponent = ({ className }: { className?: string }) =>
    mutationBanner.isShown ? (
      <Banner
        title="title"
        hideTitle
        description={mutationBanner.description}
        variant={mutationBanner.variant}
        className={className || "m-2"}
        onDismiss={hideBanner}
      />
    ) : null;

  return { BannerComponent, showBanner, hideBanner };
}

import { UseRouterType } from "./lib/definitions.js";
declare const useRouter: () => {
    toHref: (href: UseRouterType) => string;
    push: (href: UseRouterType) => void;
    back(): void;
    forward(): void;
    refresh(): void;
    replace(href: string, options?: import("next/dist/shared/lib/app-router-context.shared-runtime.js").NavigateOptions): void;
    prefetch(href: string, options?: import("next/dist/shared/lib/app-router-context.shared-runtime.js").PrefetchOptions): void;
};
export default useRouter;

import { UseRouterType } from "./lib/definitions.js";
/**
 * Enhanced useRouter of next/navigation, the hook's allow to pass a object with path and option to push or convert to string URL by toHref.
 * The object's path can be a template string with params and searchParams.
 * Example:
 * ```tsx
 * const { push } = useRouter();
 *
 * <div onClick={() =>
 *  push({
 *    path: "/example/route/id/:id/detail",
 *    options: {
 *      params: { id },
 *      searchParams: { page: 1, limit: 10 },
 *    },
 *  })
 * }
 * ></div>
 * ```
 * @returns standard Next useRouter's function, toHref, push
 */
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

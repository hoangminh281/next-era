import { isEmpty, isObject, isString, isUndefined, mapValues, omitBy, template, templateSettings, toString, } from "lodash";
import { flattenDeep } from "next-era/utils";
import { useRouter as useNextRouter } from "next/navigation.js";
import { useCallback } from "react";
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
const useRouter = () => {
    const router = useNextRouter();
    const toHref = useCallback((href) => {
        if (isString(href)) {
            return href;
        }
        if (isObject(href)) {
            let uri = href.path;
            let query = "";
            if (isObject(href.options)) {
                const search = new URLSearchParams(mapValues(flattenDeep(omitBy(href.options.searchParams, isUndefined)), toString)).toString();
                templateSettings.interpolate = /:([^\/]+)/g;
                uri = template(href.path)(mapValues(href.options.params, encodeURIComponent));
                query = search ? "?" + search : "";
            }
            return uri + query;
        }
        return "";
    }, []);
    const push = useCallback((href) => {
        const uri = toHref(href);
        if (!isEmpty(uri)) {
            router.push(uri);
        }
    }, []);
    return {
        ...router,
        toHref,
        push,
    };
};
export default useRouter;

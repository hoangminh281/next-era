import { UseFetchDataType, UseFetchMethodEnum, UseFetchOptionType } from "./lib/definitions.js";
/**
 * Hook to fetch data from API. To use this hook, you need to provide the base URL of the API in config file. If you don't provide, it will throw an error: "Base URL not found. Please provide by one of ways: Passing 'baseURL' into option of hook's param. Setting 'NEXT_ERA_API_URL' or 'NEXT_PUBLIC_NEXT_ERA_API_URL' (if you're working on NextJS) in '.env' config file."
 * The hook's using the concept of useSWC from SWR library, but it's more simple and easy to use. Default configuration of swc is:
 * ```json
 * {
 *    revalidateIfStale: {
 *      maxAge: 60, // 60 seconds
 *      staleWhileRevalidate: 10, // 10 seconds
 *    },
 * }
 * ```
 * @param method standard RESTful method to fetch data
 * @param uri URI of the API
 * @param options options of the hook
 * @returns state, fetcher, isFetching, error
 */
declare const useFetch: <T>(method: UseFetchMethodEnum, uri: string, options?: Partial<UseFetchOptionType<T> | {
    revalidateIfStale: boolean;
}>) => [T | undefined, (data?: UseFetchDataType) => Promise<T | undefined>, boolean, unknown];
export default useFetch;

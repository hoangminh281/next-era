import { UseFetchDataType, UseFetchMethodEnum, UseFetchOptionType } from "./lib/definitions.js";
declare const useFetch: <T>(method: UseFetchMethodEnum, uri: string, options?: Partial<UseFetchOptionType<T> | {
    revalidateIfStale: boolean;
}>) => [T | undefined, (data?: UseFetchDataType) => Promise<T | undefined>, boolean, unknown];
export default useFetch;

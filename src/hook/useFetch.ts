import {
  assignWith,
  has,
  isObject,
  isPlainObject,
  isUndefined,
  omit,
  unset,
} from "lodash";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { Logger } from "../log/index.js";
import {
  FetcherBodyType,
  FetcherDataType,
  ResponseType,
  UseFetchDataType,
  UseFetchMethodEnum,
  UseFetchOptionType,
  UseFetchPlainDataType,
} from "./lib/definitions.js";
import { useBool } from "./useBool.js";
import useRouter from "./useRouter.js";

const cachingData: Record<
  string,
  {
    response: ResponseType;
    isToggle: boolean;
    revalidateIfStale: { isStale: boolean; timestamp: number };
  }
> = {};
const fetchingData: Record<
  string,
  {
    resolve: (value: ResponseType | PromiseLike<ResponseType>) => void;
    reject: (reason?: unknown) => void;
  }[]
> = {};

function doFetch<T>(
  options: UseFetchOptionType<T>,
  data: FetcherDataType,
): Promise<ResponseType> {
  return new Promise(async (resolve, reject) => {
    const key = JSON.stringify({
      url: data.url,
      options: data.options,
    });
    const { debug, error, groupEnd } = new Logger(
      options,
      data,
      () => cachingData[key],
      () => fetchingData[key],
    ).groupCollapsed("doFetch");

    try {
      const hasCaching = has(cachingData, key);

      if (hasCaching) {
        if (!cachingData[key].revalidateIfStale.isStale) {
          // Caching data is living, do not fetch
          debug`Caching data is living, stop fetching`.groupEnd();

          return resolve(cachingData[key].response);
        }
      }

      // Saving promise for waiting until completing fetching
      fetchingData[key] = [...(fetchingData[key] || []), { resolve, reject }];
      debug`Saving promise for waiting until completing fetching`;

      if (fetchingData[key].length > 1) {
        // Fetching is running, do not fetch
        debug`Fetching is running, stop fetching`.groupEnd();

        return;
      }

      // Start fetching
      debug`Start fetching`;

      // Running fetching
      const fetched = await fetch(data.url, data.options);
      const response = {
        headers: fetched.headers,
        status: fetched.status,
        data: (await fetched.json()).data,
      };
      debug`Complete fetching`;

      if (isObject(options.revalidateIfStale)) {
        // Saving response to caching data
        cachingData[key] = {
          response,
          isToggle: false,
          revalidateIfStale: {
            isStale: false,
            timestamp: Date.now(),
          },
        };
        debug`Saving response to caching data`;
      }

      let promise;
      let index = 1;

      while (typeof (promise = fetchingData[key].shift()) !== "undefined") {
        // Completing fetching, resolve response for saved promises
        promise.resolve(response);
        debug`Resolve response for saved promise: #${index}`;
        index++;
      }

      // Remove completed fetching data out
      unset(fetchingData, key);
      debug`Remove completed fetching data out`;
    } catch (e) {
      let promise;
      const index = 1;

      while (typeof (promise = fetchingData[key].shift()) !== "undefined") {
        // Completing fetching, reject error for saved promises
        promise.reject(e);
        error`Reject error for saved promise: #${index}`;
      }

      unset(fetchingData, key);
      debug`Remove completed fetching data out`;
    }

    groupEnd();
  });
}

function doCache<T>(
  options: UseFetchOptionType<T>,
  data: FetcherDataType,
): ResponseType | undefined {
  const key = JSON.stringify({ url: data.url, options: data.options });
  const { debug } = new Logger(
    options,
    data,
    () => cachingData[key],
    () => fetchingData[key],
  ).groupCollapsed("doCache");
  const hasCaching = has(cachingData, key);

  if (!hasCaching) {
    // Caching data is not found, going to fetch
    debug`Caching data is not found`.groupEnd();

    return;
  }

  if (!cachingData[key].isToggle) {
    // Caching data is turned off, going to fetch
    debug`Caching data is turned off`.groupEnd();

    return;
  }

  // Caching data is living or staling, valid to use
  // For live status: use caching data, do not fetching
  // For stale status: use caching data, going to fetch
  debug`Caching data is living or staling, valid to use`.groupEnd();

  return cachingData[key].response;
}

function doRevalidate<T>(
  options: UseFetchOptionType<T>,
  data: FetcherDataType,
) {
  const key = JSON.stringify({ url: data.url, options: data.options });
  const { debug, groupEnd } = new Logger(
    options,
    data,
    () => cachingData[key],
    () => fetchingData[key],
  ).groupCollapsed("doRevalidate");
  const hasCaching = has(cachingData, key);

  if (!hasCaching) {
    // Caching data is not found, going to fetch
    debug`Caching data is not found`.groupEnd();

    return;
  }

  if (!isObject(options.revalidateIfStale)) {
    // RevalidateIfStale is not toggled, turn caching data off, going to fetch
    cachingData[key].isToggle = false;
    debug`revalidateIfStale is turned off`.groupEnd();

    return;
  } else {
    // RevalidateIfStale is toggled, turn caching data on
    cachingData[key].isToggle = true;
    debug`revalidateIfStale is turned on`;
  }

  if (!cachingData[key].revalidateIfStale.isStale) {
    // Caching data is living, checking if still living
    const isExpired =
      Date.now() - cachingData[key].revalidateIfStale.timestamp >
      options.revalidateIfStale.maxAge;

    if (isExpired) {
      // Caching data is staled
      cachingData[key].revalidateIfStale.isStale = true;
      cachingData[key].revalidateIfStale.timestamp = Date.now();
      debug`Caching data is staled`;
    } else {
      // Caching data is living
      debug`Caching data is living`;
    }
  } else {
    // Caching data is staled, checking if still stale
    const isExpired =
      Date.now() - cachingData[key].revalidateIfStale.timestamp >
      options.revalidateIfStale.staleWhileRevalidate;

    if (isExpired) {
      // Caching data is spoiled, remove it out
      unset(cachingData, key);
      debug`Caching data is spoiled`;
    }
  }
  groupEnd();
}

const defaultUseFetchOptions = {
  revalidateIfStale: false,
  formatter: async <T>(response: ResponseType) =>
    Promise.resolve(response?.data as T),
  baseURL:
    process.env.NEXT_PUBLIC_NEXT_ERA_API_URL || process.env.NEXT_ERA_API_URL,
};

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
const useFetch = <T>(
  method: UseFetchMethodEnum,
  uri: string,
  options: Partial<UseFetchOptionType<T>> = {},
): [
  T | undefined,
  (data?: UseFetchDataType) => Promise<T | undefined>,
  boolean,
  unknown,
  Dispatch<SetStateAction<T | undefined>>,
] => {
  const { toHref } = useRouter();

  const [data, setData] = useState<T>();
  const [isFetching, start, stop] = useBool();
  const [error, setError] = useState<unknown>();

  const getUseFetchOptions = useCallback(
    (defaultOptions: UseFetchOptionType<T>) =>
      assignWith({}, options, defaultOptions, (objValue, srcValue) => {
        if (isUndefined(objValue)) {
          return srcValue;
        }

        if (objValue === true) {
          return srcValue || objValue;
        }

        if (objValue === false) {
          return undefined;
        }

        return objValue;
      }),
    [options],
  );

  const fetcher = useCallback(
    async (data?: UseFetchDataType) => {
      new Logger(data).groupCollapsed("useFetch").debug`Start fetching`;

      try {
        start();

        let useFetchOptions: UseFetchOptionType<T> = getUseFetchOptions(
          defaultUseFetchOptions,
        );

        if (!useFetchOptions.baseURL) {
          throw new Error(
            "Base URL not found. Please provide by one of ways:\n" +
              "\tPassing 'baseURL' into option of hook's param.\n" +
              "\tSetting 'NEXT_ERA_API_URL' or 'NEXT_PUBLIC_NEXT_ERA_API_URL' (if you're working on NextJS) in '.env' config file.",
          );
        }

        let path = uri;
        let body = data;

        if (isPlainObject(data)) {
          data = data as UseFetchPlainDataType;

          path = toHref({
            path,
            options: {
              params: data.params,
              searchParams: data.searchParams,
            },
          });
          body = omit(data, ["params", "searchParams"]);
        }

        const fetcherData: FetcherDataType = {
          url: new URL(path, useFetchOptions.baseURL).toString(),
        };

        switch (method) {
          case UseFetchMethodEnum.GET:
            useFetchOptions = getUseFetchOptions({
              ...useFetchOptions,
              revalidateIfStale: {
                maxAge: 60, // 60 seconds
                staleWhileRevalidate: 10, // 10 seconds
              },
            });

            break;

          case UseFetchMethodEnum.POST:
          case UseFetchMethodEnum.PUT:
            if (!isPlainObject(body)) {
              fetcherData.options = {
                method,
                body: body as FetcherBodyType,
              };

              break;
            }

          default:
            fetcherData.options = {
              headers: {
                "Content-Type": "application/json",
              },
              method,
              body: JSON.stringify(body),
            };

            break;
        }

        doRevalidate(useFetchOptions, fetcherData);

        let response = doCache(useFetchOptions, fetcherData);

        response
          ? doFetch(useFetchOptions, fetcherData)
          : (response = await doFetch(useFetchOptions, fetcherData));

        const formattedResponse = await useFetchOptions.formatter(response);
        const { debug } = new Logger(
          options,
          data,
          undefined,
          undefined,
          formattedResponse,
        );

        setData(formattedResponse);

        debug`Complete fetching`;

        return formattedResponse;
      } catch (e) {
        setError(e);
      } finally {
        stop();

        new Logger(data).debug`End fetching`.groupEnd();
      }
    },
    [
      uri,
      method,
      start,
      stop,
      setData,
      setError,
      getUseFetchOptions,
      toHref,
      options,
    ],
  );

  return [data, fetcher, isFetching, error, setData];
};

export default useFetch;

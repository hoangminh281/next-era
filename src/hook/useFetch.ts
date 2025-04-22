import { assignWith, isPlainObject, isUndefined, omit, unset } from "lodash";
import { useCallback, useRef, useState } from "react";
import { Logger } from "../log/index.js";
import {
  FetcherBodyType,
  FetcherDataType,
  ResponseType,
  UseFetchDataType,
  UseFetchErrorType,
  UseFetchMethodEnum,
  UseFetchOptionType,
  UseFetchPlainDataType,
  UseFetchReturnType,
  UseFetchStorageType,
} from "./lib/definitions.js";
import { useBool } from "./useBool.js";
import useRouter from "./useRouter.js";

const fetchingStorage = {};

function doFetch<D, E>(
  options: UseFetchOptionType<D, E>,
  data: FetcherDataType,
): Promise<ResponseType<E>> {
  const _fetchingStorage: UseFetchStorageType<E> = fetchingStorage;

  return new Promise(async (resolve, reject) => {
    const key = JSON.stringify({
      url: data.url,
      options: data.options,
    });
    const { debug, error, groupEnd } = new Logger(
      options,
      data,
      () => _fetchingStorage[key],
    ).groupCollapsed("doFetch");

    // Saving promise for waiting until completing fetching
    _fetchingStorage[key] = [
      ...(_fetchingStorage[key] || []),
      { resolve, reject },
    ];
    debug`Saving promise for waiting until completing fetching`;

    if (_fetchingStorage[key].length > 1) {
      // Fetching is running, do not fetch
      debug`Fetching is running, stop fetching`.groupEnd();

      return;
    }

    // Start fetching
    debug`Start fetching`;

    // Running fetching
    const fetched = await fetch(data.url, data.options);
    const response = fetched.ok
      ? {
          headers: fetched.headers,
          status: fetched.status,
          data: (await fetched.json()).data,
        }
      : {
          headers: fetched.headers,
          status: fetched.status,
          error: JSON.parse(await fetched.text()) as E,
        };
    debug`Complete fetching`;

    let promise;
    let index = 1;

    while (typeof (promise = _fetchingStorage[key].shift()) !== "undefined") {
      // Completing fetching, resolve/reject response for saved promises
      if (fetched.ok) {
        promise.resolve(response);
        debug`Resolve response for saved promise: #${index}`;
      } else {
        promise.reject(response);
        error`Reject error for saved promise: #${index}`;
      }
      index++;
    }

    // Remove completed fetching data out
    unset(fetchingStorage, key);
    debug`Remove completed fetching data out`;

    groupEnd();
  });
}

const defaultUseFetchOptions = {
  formatter: async <D, E>(response: ResponseType<E>) =>
    Promise.resolve(response?.data as D),
  baseURL:
    process.env.NEXT_PUBLIC_NEXT_ERA_API_URL || process.env.NEXT_ERA_API_URL,
};

/**
 * Hook to fetch data from API. To use this hook, you need to provide the base URL of the API in config file. If you don't provide, it will throw an error: "Base URL not found. Please provide by one of ways: Passing 'baseURL' into option of hook's param. Setting 'NEXT_ERA_API_URL' or 'NEXT_PUBLIC_NEXT_ERA_API_URL' (if you're working on NextJS) in '.env' config file."
 * @param method standard RESTful method to fetch data
 * @param uri URI of the API
 * @param options options of the hook
 * @returns state, fetcher, isFetching, error
 */
const useFetch = <D, E = UseFetchErrorType>(
  method: UseFetchMethodEnum,
  uri: string,
  options?: Partial<UseFetchOptionType<D, E>>,
): UseFetchReturnType<D, E> => {
  const { toHref } = useRouter();

  const [data, setData] = useState<D | undefined>(options?.defaultData);
  const [isFetching, start, stop] = useBool();
  const [error, setError] = useState<E>();

  const controller = useRef<AbortController>();

  const getUseFetchOptions = useCallback(
    (defaultOptions: UseFetchOptionType<D, E>) =>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const fetcher = useCallback(
    async (data?: UseFetchDataType) => {
      new Logger(data).groupCollapsed("useFetch").debug`Start fetching`;

      try {
        start();

        const useFetchOptions: UseFetchOptionType<D, E> = getUseFetchOptions(
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

        controller.current = new AbortController();
        const fetcherData: FetcherDataType = {
          url: new URL(path, useFetchOptions.baseURL).toString(),
          options: {
            signal: controller.current.signal,
          },
        };

        switch (method) {
          case UseFetchMethodEnum.GET:
            break;

          case UseFetchMethodEnum.POST:
          case UseFetchMethodEnum.PUT:
            if (!isPlainObject(body)) {
              fetcherData.options = {
                ...fetcherData.options,
                method,
                body: body as FetcherBodyType,
              };

              break;
            }

          default:
            fetcherData.options = {
              ...fetcherData.options,
              headers: {
                "Content-Type": "application/json",
              },
              method,
              body: JSON.stringify(body),
            };

            break;
        }

        try {
          const response = await doFetch<D, E>(useFetchOptions, fetcherData);

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
          const { error } = e as ResponseType<E>;

          error && setError(error);
        }
      } finally {
        stop();

        new Logger(data).debug`End fetching`.groupEnd();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uri, method, start, stop, setData, setError, getUseFetchOptions, toHref],
  );

  const cancel = useCallback(() => controller.current?.abort(), []);

  const useFetcher = [
    data,
    fetcher,
    isFetching,
    error,
    setData,
    cancel,
  ] as UseFetchReturnType<D, E>;

  useFetcher.setData = setData;
  useFetcher.cancel = cancel;

  return useFetcher;
};

export default useFetch;

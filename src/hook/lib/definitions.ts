import { Dispatch, SetStateAction } from "react";

export type UseFetchStorageType<E> = Record<
  string,
  {
    resolve: (value: ResponseType<E> | PromiseLike<ResponseType<E>>) => void;
    reject: (reason?: ResponseType<E>) => void;
  }[]
>;

export enum UseFetchMethodEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export type UseFetchOptionType<D, E> = {
  formatter: (response: ResponseType<E>) => Promise<D>;
  baseURL?: string;
  defaultData?: D;
};

export type UseFetchErrorType =
  | {
      error: string;
    }
  | undefined;

export type UseFetchReturnType<D, E> = [
  D | undefined,
  (data?: UseFetchDataType) => Promise<D | undefined>,
  boolean,
  E,
  Dispatch<SetStateAction<D | undefined>>,
  () => void,
] & { setData: Dispatch<SetStateAction<D | undefined>>; cancel: () => void };

export type FetcherBodyType = ReadableStream | XMLHttpRequestBodyInit;

type FetcherOptionType = Partial<{
  method: UseFetchMethodEnum;
  headers: Record<string, string>;
  body: FetcherBodyType;
  signal: AbortSignal;
}>;

export type FetcherDataType = {
  url: string;
  options?: FetcherOptionType;
};

export type QueryType = Partial<{
  params: Record<string, string | number | undefined>;
  searchParams: Record<
    string,
    string | number | Record<string, string | number | undefined> | undefined
  >;
}>;

export type UseFetchPlainDataType = QueryType &
  Record<
    string,
    string | number | Record<string, string | number | undefined> | undefined
  >;

export type UseFetchDataType = UseFetchPlainDataType | FormData | File;

export type ResponseType<E> = {
  headers: Headers;
  status: number;
  data?: unknown;
  error?: E;
};

export type UseRouterType =
  | string
  | {
      path: string;
      options?: QueryType;
    };

export type UseFormChangeHandlerType = {
  event: React.FormEvent<HTMLFormElement> & {
    target: HTMLFormElement;
  };
  name: string;
  type: string;
  checked: boolean;
  value: (defaultValue: string | null | undefined) => string;
};

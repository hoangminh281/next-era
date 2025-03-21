export enum UseFetchMethodEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export type UseFetchOptionType<T> = {
  revalidateIfStale?:
    | {
        maxAge: number;
        staleWhileRevalidate: number;
      }
    | boolean;
  formatter: (response: ResponseType) => Promise<T>;
  baseURL?: string;
};

export type FetcherBodyType = ReadableStream | XMLHttpRequestBodyInit;

type FetcherOptionType = Partial<{
  method: UseFetchMethodEnum;
  headers: Record<string, string>;
  body: FetcherBodyType;
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

export type ResponseType = {
  headers: Headers;
  status: number;
  data: unknown;
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
  value: (defaultValue: unknown) => unknown;
};

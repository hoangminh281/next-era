export enum NextEraPluginMethodEnum {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Delete = "DELETE",
  Options = "OPTIONS",
}

export type NextEraPluginStragegyFilterType = {
  method?: NextEraPluginMethodEnum;
  url?: string;
  allow: boolean;
  [other: string]: unknown;
};

export type NextEraPluginType = {
  sw: {
    nodeEnv: "development" | "production" | string;
    cacheName: string;
    resources: string[];
    strategy: {
      filter: NextEraPluginStragegyFilterType[];
      cf: string[];
      nf: string[];
      swr: string[];
    };
  };
};

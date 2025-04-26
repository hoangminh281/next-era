import { NextEraPluginMethodEnum } from "../src/sw/lib/definitions";
import { TemplateType } from "../src/test/lib/definitions";

export default {
  "/src/sw/public/sw.ts": {
    isAllowedFetchEvent: {
      test: {
        config: {
          concurrency: true,
        },
        context: {
          self: {
            addEventListener: () => null,
          },
        },
        cases: [
          {
            label: "No config -> not allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [],
            ],
            output: false,
          },
          {
            label: "Config same allowed method -> allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [{ method: NextEraPluginMethodEnum.GET, allow: true }],
            ],
            output: true,
          },
          {
            label: "Config same not-allowed method -> not allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [{ method: NextEraPluginMethodEnum.GET, allow: false }],
            ],
            output: false,
          },
          {
            label: "Config diff allowed method -> not allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [{ method: NextEraPluginMethodEnum.POST, allow: true }],
            ],
            output: false,
          },
          {
            label: "Config diff not-allowed method -> not allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [{ method: NextEraPluginMethodEnum.POST, allow: false }],
            ],
            output: false,
          },
          {
            label: "Config same allowed method and url -> allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [
                {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                  allow: true,
                },
              ],
            ],
            output: true,
          },
          {
            label: "Config same not-allowed method and url -> not allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [
                {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                  allow: false,
                },
              ],
            ],
            output: false,
          },
          {
            label:
              "Config same allowed method and diff allowed url -> not allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [
                {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/diff",
                  allow: true,
                },
              ],
            ],
            output: false,
          },
          {
            label:
              "Config same not allowed method and diff allowed url -> not allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [
                {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/diff",
                  allow: false,
                },
              ],
            ],
            output: false,
          },
          {
            label:
              "Config diff allowed method and same allowed url -> not allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [
                {
                  method: NextEraPluginMethodEnum.POST,
                  url: "/api/same",
                  allow: true,
                },
              ],
            ],
            output: false,
          },
          {
            label:
              "Config diff not allowed method and same allowed url -> not allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [
                {
                  method: NextEraPluginMethodEnum.POST,
                  url: "/api/same",
                  allow: false,
                },
              ],
            ],
            output: false,
          },
          {
            label: "Config diff allowed method and url -> not allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [
                {
                  method: NextEraPluginMethodEnum.POST,
                  url: "/api/diff",
                  allow: true,
                },
              ],
            ],
            output: false,
          },
          {
            label: "Config diff not allowed method and url -> not allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [
                {
                  method: NextEraPluginMethodEnum.POST,
                  url: "/api/diff",
                  allow: false,
                },
              ],
            ],
            output: false,
          },
          {
            label: "Config diff a filter and same other filter -> allow",
            input: [
              {
                request: {
                  method: NextEraPluginMethodEnum.GET,
                  url: "/api/same",
                },
              },
              [
                {
                  url: "/api/diff",
                  allow: false,
                },
                {
                  method: NextEraPluginMethodEnum.GET,
                  allow: true,
                },
              ],
            ],
            output: true,
          },
        ],
      },
    },
    wildcardize: {
      test: {
        config: {
          concurrency: true,
        },
        context: {
          self: {
            addEventListener: () => null,
          },
        },
        cases: [
          {
            input: (fn) => fn("file-*.txt").source,
            output: "file-[^/]*\\.txt$",
          },
          {
            input: (fn) => fn("data/**/report").source,
            output: "data\\/.*\\/report$",
          },
          {
            input: (fn) => fn("logs/??.log").source,
            output: "logs\\/..\\.log$",
          },
        ],
      },
    },
  },
} satisfies {
  [module: string]: {
    isAllowedFetchEvent: TemplateType<
      [
        {
          request: {
            method: NextEraPluginMethodEnum;
            url: string;
          };
        },
        {
          method?: NextEraPluginMethodEnum;
          url?: string;
          allow: boolean;
        }[],
      ],
      boolean
    >;
    wildcardize: TemplateType<
      (fn: (pattern: string) => RegExp) => string,
      string
    >;
  };
};

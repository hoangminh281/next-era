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
            expected: false,
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
            expected: true,
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
            expected: false,
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
            expected: false,
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
            expected: false,
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
            expected: true,
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
            expected: false,
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
            expected: false,
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
            expected: false,
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
            expected: false,
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
            expected: false,
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
            expected: false,
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
            expected: false,
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
            expected: true,
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
            expected: "file-[^/]*\\.txt$",
          },
          {
            input: (fn) => fn("data/**/report").source,
            expected: "data\\/.*\\/report$",
          },
          {
            input: (fn) => fn("logs/??.log").source,
            expected: "logs\\/..\\.log$",
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

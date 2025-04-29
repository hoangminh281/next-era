# 🚀 Next Era

Welcome to **Next Era**! A comprehensive library designed to supercharge your **Next.js** applications with powerful utilities and significant performance optimizations. Build faster, more efficient, and feature-rich Next.js projects with ease.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Progressive Web App (PWA)](#progressive-web-app-pwa)
  - [Component (CSR)](#component-csr)
  - [API Routes (SSR/SSG)](#api-routes-ssrssg)
  - [Logging](#logging)
  - [Testing](#testing)
  - [Utilities](#utilities)
- [Contributing](#contributing)
- [License](#license)

## Introduction

**Next Era** is a powerful and flexible utility package designed to supercharge your **Next.js** applications. Built with a deep understanding of **Next.js** principles and leveraging the power of **Vercel** and **Lodash**, Next Era enhances performance, developer experience, and adds advanced features to your **SSR, SSG, and CSR** Next.js projects.

Tired of boilerplate or looking for optimized solutions for common Next.js tasks? Next Era provides a suite of fast, minimalist tools to boost your productivity and streamline your workflows, helping you build faster and more efficient applications.

## Features

- **Intuitive and Developer-Friendly Utilities:** Designed for ease of use and seamless integration into your Next.js workflow.
- **Leverages Next.js, Vercel, and Lodash:** Built on a solid foundation of industry-leading technologies for reliability and performance.
- **Optimized Data Fetching (Powered by SWC):** Experience improved efficiency and speed in your data fetching operations.
- **Effortless Progressive Web App (PWA) Integration:** Transform your Next.js app into a PWA with streamlined offline support and enhanced user engagement.

## Installation

Install via **npm**, **yarn**, or **pnpm**:

```bash
npm install next-era
# or
yarn add next-era
# or
pnpm add next-era
```

## Usage

### Progressive Web App (PWA)

Next Era helps turn your Next.js application into a **Progressive Web App (PWA)** with efficient caching strategies to optimize performance and offline access.

Comparison of using `Next.js` + `next-era`

![Screen record about the loading time of a Next.js](https://res.cloudinary.com/dwf0elilp/image/upload/w_500/v1743060877/With_nextjs_ynvqj1.gif)

![Screen record about the loading time of a Next.js + next-era](https://res.cloudinary.com/dwf0elilp/image/upload/w_500/v1743060873/With_nextjs_next-era_dlweii.gif)

#### NextEraPlugin (Webpack)

This plugin generates a `sw.js` file with predefined caching strategies to optimize loading times while maintaining continuous development and deployment workflows.

By default, we have a static resource strategy and 3 fetching strategies [[Reference](https://developer.chrome.com/docs/workbox/caching-strategies-overview)] includes:

##### Prefeching resource

During the Service Worker installation phase, configured static resources are preloaded and cached for quick access.

By default, all of assets in `public` folder will be considered as is the static resources and will be prefetched automatically.

- **Example: in next.config.mjs**

```ts
import { NextEraPlugin } from "next-era/sw";

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new NextEraPlugin({
          sw: {
            resources: [
              "/manifest.webmanifest",
              "/opengraph-image.png",
              "/favicon.ico",
            ], // all of assets in `public` folder and 3 assets as configuration will be prefetched
          },
        }),
      );
    }

    return config;
  },
};
```

##### Cache First (CF)

Retrieves resources from the cache first, falling back to network fetching if needed. Best for static assets.

- **Example: in next.config.mjs**

```ts
import { NextEraPlugin } from "next-era/sw";

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new NextEraPlugin({
          sw: {
            resources: [
              "/manifest.webmanifest",
              "/opengraph-image.png",
              "/favicon.ico",
            ],
            strategy: {
              cf: ["/not-found.png"], // Apply for static resources like not-found image
            },
          },
        }),
      );
    }

    return config;
  },
};
```

##### Network First (NF)

Fetches from the network first, caching responses for future use. Ideal for dynamic data like API requests.

- **Example: in next.config.mjs**

```ts
import { NextEraPlugin } from "next-era/sw";

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new NextEraPlugin({
          sw: {
            resources: [
              "/manifest.webmanifest",
              "/opengraph-image.png",
              "/favicon.ico",
            ],
            strategy: {
              cf: ["/not-found.png"],
              nf: ["/api/**"], // Apply for API fetching
            },
          },
        }),
      );
    }

    return config;
  },
};
```

##### Stale While Revalidate (SWR)

Serves cached data while simultaneously fetching and updating it from the network. Suitable for page/layout data.

- **Example: in next.config.mjs**

```ts
import { NextEraPlugin } from "next-era/sw";

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new NextEraPlugin({
          sw: {
            resources: [
              "/manifest.webmanifest",
              "/opengraph-image.png",
              "/favicon.ico",
            ],
            strategy: {
              cf: ["/not-found.png"],
              nf: ["/api/**"],
              swr: ["/**"], // others thing such as page/layout
            },
          },
        }),
      );
    }

    return config;
  },
};
```

> [!CAUTION]
> The order of strategies should be `CF → NF → SWR` to ensure optimal request handling.

> [!IMPORTANT]
> In Development mode, the Service Worker strategy will always be set to `/**` for `NF` to ensure the freshest data is fetched during coding.

##### Others

- **Example: in next.config.mjs**

```ts
import { NextEraPlugin } from "next-era/sw";

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new NextEraPlugin({
          sw: {
            // Use buildId as the cache name to invalidate old caches on each build and ensure clients get the latest version
            cacheName: buildId,
            strategy: {
              filter: [
                // Filter requests handled by the Service Worker
                // - Block all requests to /auth/**
                { url: "/auth/**", allow: false },
                // - Allow only GET requests by default
                { method: NextEraPluginMethodEnum.Get, allow: true },
              ],
            },
          },
        }),
      );
    }

    return config;
  },
};
```

#### NextEraWorker (Hook Component)

This component registers events for `sw.js` into the Service Worker. Place it inside `layout.tsx` within the `app` folder.

Looking into the hook component, you can see `sw.js?v=` a Service Worker script URI that be attached versioning to trigger updating after code changed.

- **Example: in next.config.mjs**

```tsx
import { NextEraWorker } from "next-era/sw";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <NextEraWorker />
      </body>
    </html>
  );
}
```

#### `sw.js` (Dynamic SW script)

This is the script file that will be registered into the Service Worker. `sw.js` is dynamically generated and updated during build time, then placed into the `public` folder of the project.

### Component (CSR)

#### `useActionState`

Enhanced version of React's `useActionState`, allowing manual state updates via `setState`.

- **Original:**

```ts
import { useActionState } from "react";

const [errorMessage, formAction, isPending] = useActionState(
  authenticate,
  undefined,
);
```

- **Enhanced:**

```ts
import { useActionState } from "next-era/hook";

const [errorMessage, formAction, isPending, setErrorMessage] = useActionState(
  authenticate,
  undefined,
);
// `setErrorMessage` allows manual updates to `errorMessage`
```

#### `useBool`

A hook for managing boolean state.

- **Example:**

```ts
import { useBool } from "next-era/hook";

const [isEditing, enableEditing, disableEditing] = useBool();
```

#### `useFetch`

A flexible hook for fetching API data.

- **Requires:** A base API URL configured in `.env` or passed as an option. `NEXT_ERA_API_URL` or `NEXT_PUBLIC_NEXT_ERA_API_URL` (if you're working on NextJS)
- **Uses:** ~~`useFetch` (inspired by SWR) for optimized data fetching.~~ `useFetch` for enhanced pass params/queries.

- **Example:**

```ts
import { useFetch } from "next-era/hook";

const [values, fetchValues] = useFetch<ExampleType[]>(
  UseFetchMethodEnum.GET,
  "/api/example/route",
  {
    formatter: async ({ data }) =>
      data.map(({ name, id }) => ({ label: name, value: id })),
  },
);
```

#### `useRouter`

Enhanced version of Next.js' `useRouter` with improved path handling.

- **Example:**

```tsx
import { useRouter } from "next-era/hook";

const { push } = useRouter();

return (
  <div
    onClick={() =>
      push({
        path: "/example/route/id/:id/detail",
        options: {
          params: { id },
          searchParams: { page: 1, limit: 10 },
        },
      })
    }
  />
);
```

- **Example #2:**

```tsx
import { useRouter } from "next-era/hook";

const { toHref } = useRouter();

return (
  <Link
    href={toHref({
      path: "/example/route/id/:id/detail",
      options: {
        params: { id },
        searchParams: { page: 1, limit: 10 },
      },
    })}
  />
);
```

### API Routes (SSR/SSG)

#### `factory`

Factory function for creating DTO instances.

- **Example:**

```ts
import { Factory } from "next-era/db";

await Factory<ToType>(fromObject).to(toDTO);
```

- **Example #2:**

```ts
import { Factory } from "next-era/db";

await Factory<ToType>(fromArray).toArray(toDTO);
```

#### `withSQL`

A secure SQL query builder for **Vercel/Postgres**, using parameterized queries.

- **Example: Select clause:**

```ts
import { withSQL } from "next-era/db";

async function get(name, createdBy) {
  return await withSQL(sql)
    .select({
      columns: ["id", "name"],
      from: "tableName",
      where: {
        and: {
          name,
          createdBy,
        },
      },
      order: {
        by: "createdDate",
        sort,
      },
      limit: 20,
      offset,
    })
    .execute();
}
```

- **Example: Create clause:**

```ts
import { withSQL } from "next-era/db";

async function create(data: DataDTO) {
  await withSQL(sql)
    .create({
      into: "tableName",
      values: {
        name: data.name,
      },
    })
    .execute();
}
```

- **Example: Create multi rows clause:**

```ts
import { withSQL } from "next-era/db";

async function creates(datas: DataType[]) {
  await withSQL(sql)
    .creates(
      map(datas, (data) => ({
        into: "tableName",
        values: {
          name: data.name,
        },
      })),
    )
    .execute();
}
```

- **Example: Update clause:**

```ts
import { withSQL } from "next-era/db";

async function update(data: DataDTO) {
  await withSQL(sql)
    .update({
      on: "tableName",
      set: {
        name: data.name,
      },
      where: {
        and: {
          id: data.id,
        },
      },
    })
    .execute();
}
```

- **Example: Delete clause:**

```ts
import { withSQL } from "next-era/db";

async function _delete({ id, createdBy }) {
  await withSQL(sql)
    .delete({
      from: "tableName",
      where: {
        and: {
          id,
          createdBy,
        },
      },
    })
    .execute();
}
```

- **Example: Count data:**

```ts
import { withSQL } from "next-era/db";

async function coundByIds({
  ids,
  createdBy,
}: {
  ids: string;
  createdBy: string;
}): Promise<number> {
  const count = await withSQL(sql)
    .select({
      from: "tableName",
      columns: "count(*)",
      where: {
        and: {
          id: {
            in: ids,
          },
          createdBy,
        },
      },
    })
    .execute();

  return Number(count.rows[0].count);
}
```

- **Example: Complex clause:**

```ts
import { withSQL } from "next-era/db";

async function readsSameNameById({
  id,
  createdBy,
}: {
  id: string;
  createdBy: string;
}) {
  const datas = await withSQL(sql)
    .select({
      from: "tableName",
      columns: ["id", "name"],
      where: {
        and: {
          name: {
            raw: withSQL(sql)
              .select({
                from: "tableName2",
                columns: "name",
                where: { id, createdBy },
              })
              .toRaw(),
          },
          createdBy,
        },
      },
      limit: 20,
    })
    .execute();

  return await Factory<WordType>(words.rows).toArray(WordDTO);
}
```

#### `withTransaction`

A wrapper for handling database transactions with automatic rollback support.

- **Example:**

```ts
import { withTransaction } from "next-era/db";

withTransaction(sql, sql.query(query, parameterizedValues));
```

### Logging

The `Logger` class provides a structured and grouped logging system.

- **Example:**

```ts
import { Logger } from "next-era/log";

const { debug } = new Logger(data).groupCollapsed("Group Label");

debug`Processing...`;
debug`Completed.`.groupEnd();
```

### Testing

Next Era makes unit testing clean, boilerplate-free, and safe—no need to export your internal functions or test modules explicitly.

✅ Requirements

- Install `tsx` as a dev dependency.
- Add a test script to your package.json:

```bash
{
  "scripts": {
    "test": "pnpm next-era test"
  }
}
```

🗂 Directory Structure

Create a /test folder in the project root for your specs. Each test file should export a test configuration object.

✍️ Example

`test/utils.spec.ts` – testing `generatePagination` from `app/lib/utils.ts`:

```ts
// app/lib/utils.ts

function generatePagination(currentPage: number, totalPages: number) {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}
```

```ts
// test/utils.spec.ts

import { TemplateType } from "next-era/test/types";

export default {
  "/app/lib/utils.ts": {
    // Module's path
    generatePagination: {
      // Function to test
      test: {
        label: "", // Optional, function's name will be shown as default. Ex: generatePagination
        config: {
          concurrency: true, // config of test runner in nodejs, reference: https://nodejs.org/api/test.html#testname-options-fn
        },
        context: {
          // Context of testing module to mock. Ex: global variables,...
          self: {
            addEventListener: () => null,
          },
        },
        assert: {
          method: "deepStrictEqual", // The strategy of comparison, set for all cases. Default: strictEqual
        },
        cases: [
          {
            label: "", // Optional, number will be shown as default. Ex: #1
            assert: {
              method: "deepStrictEqual", // The strategy of comparison, set for specific case. Default: strictEqual
            },
            input: [1, 7], // Input params of function, will be spread as function's param
            expected: [1, 2, 3, 4, 5, 6, 7], // Expected output of function
          },
          {
            input: [3, 8],
            expected: [1, 2, 3, "...", 7, 8],
          },
          {
            input: [6, 8],
            expected: [1, 2, "...", 6, 7, 8],
          },
          {
            input: [4, 8],
            expected: [1, "...", 3, 4, 5, "...", 8],
          },
        ],
      },
    },
  },
} satisfies {
  [module: string]: {
    generatePagination: TemplateType<[number, number], (string | number)[]>;
  };
};
```

![Image about the record of a testcase](https://res.cloudinary.com/dwf0elilp/image/upload/v1745907990/testing_pfbojg.png)

🔍 Key Benefits

- No explicit exports required: Test private/internal functions directly.
- Mock global/contextual variables: Use the context object.
- Flexible assertions: Define default or per-case comparison methods (strictEqual, deepStrictEqual, etc.).
- Concurrent execution support: Opt-in via config.concurrency.

### Utilities

#### `between`

Inserts a separator between array elements (e.g., React Nodes).

- **Example:**

```tsx
import { between } from "next-era/utils";

between(
  breadcrumbs.map((breadcrumb) => (
    <li key={breadcrumb.label} aria-current={breadcrumb.active}>
      {breadcrumb.label}
    </li>
  )),
  (index) => (
    <span key={index} className="mx-3">
      /
    </span>
  ),
);
```

#### `defaultsDeep`

A deep merge function that does not mutate the original object (Lodash alternative).

- **Example:**

```ts
import { defaultsDeep } from "next-era/utils";

defaultsDeep(...flatMap(group)).name;
```

#### `flattenDeep`

Flattens an object deeply (useful for URL search parameters). This function is using for querize object params in `useRouter`.

Convert from `{ ancestor: { parent: { brother: 'alex', sister: 'jessica' } }` to `{ 'ancestor.parent.brother': 'alex', 'ancestor.parent.sister': 'jessica' }`

- **Example:**

```tsx
import { flattenDeep } from "next-era/utils";

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  return (
    <Form
      breadcrumb={{
        breadcrumbs: [
          { label: "ancestor", href: "/ancestor" },
          { label: "parent", href: "/parent" },
        ],
        submit: {
          label: "List",
          type: {
            button: {
              href: {
                path: "/ancestor/parent/list", // be generated to href: `/ancestor/parent/list/ancestor/parent/list?ancestor.parent.brother=alex&ancestor.parent.sister=jessica`
                options: {
                  searchParams: {
                    ancestor: {
                      parent: {
                        brother: "alex",
                        sister: "jessica",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }}
    />
  );
}
```

#### `unflattenDeep`

Restores a deeply flattened object. This function is using for dequerize object params from navigating with object params.

Convert from `{ 'ancestor.parent.brother': 'alex', 'ancestor.parent.sister': 'jessica' }` to `{ ancestor: { parent: { brother: 'alex', sister: 'jessica' } }`

- **Example:**

```ts
import { unflattenDeep } from "next-era/utils";

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    [key: string]: string | number;
  }>;
}) {
  const searchParams = unflattenDeep<{ tree: TreeType }>(
    await props.searchParams,
  ); // { ancestor: { parent: { brother: 'alex', sister: 'jessica' } }
}
```

## Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository: [GitHub](https://github.com/hoangminh281/next-era)
2. Create a new branch: `git checkout -b feature-branch`
3. Commit changes: `git commit -m "Description of changes"`
4. Push to branch: `git push origin feature-branch`
5. Open a pull request.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

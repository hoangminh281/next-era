# Next Era

Welcome to the **Next Era** project! This package is a comprehensive library designed to enhance the **Next.js** framework with powerful utilities and performance optimizations.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Component (CSR)](#component-csr)
  - [API Routes (SSR/SSG)](#api-routes-ssrssg)
  - [Logging](#logging)
  - [Utilities](#utilities)
- [Contributing](#contributing)
- [License](#license)

## Introduction

**Next Era** is a powerful and flexible utility package designed to enhance **Next.js** applications by improving performance, developer experience, and adding advanced features. It provides optimized tools that integrate seamlessly with Next.js, Vercel, and Lodash.

Built with a deep understanding of **Next.js** principles, **Next Era** offers utilities that support everything from **client-side rendering (CSR)** to **server-side rendering (SSR)** and **static site generation (SSG)**. It includes a suite of fast, minimalist tools to enhance productivity and streamline workflows.

## Features

- Intuitive and easy-to-use utilities.
- Built on top of **Next.js**, **Vercel**, and **Lodash**.
- Optimized data fetching using **useSWC** for improved efficiency.

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
- **Uses:** `useFetch` (inspired by SWR) for optimized data fetching.

**Default SWC Config:**

```json
{
  "revalidateIfStale": {
    "maxAge": 60,
    "staleWhileRevalidate": 10
  }
}
```

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

const { push, toHref } = useRouter();

return (
  <>
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
    <Link
      href={toHref({
        path: "/example/route/id/:id/detail",
        options: {
          params: { id },
          searchParams: { page: 1, limit: 10 },
        },
      })}
    />
  </>
);
```

### API Routes (SSR/SSG)

#### `factory`

Factory function for creating DTO instances.

- **Example:**

```ts
import { Factory } from "next-era/db";

await Factory<ToType>(fromObject).to(toDTO);
await Factory<ToType>(fromArray).toArray(toDTO);
```

#### `withSQL`

A secure SQL query builder for **Vercel/Postgres**, using parameterized queries.

- **Example:**

```ts
import { withSQL } from "next-era/db";

withSQL(sqlPlugin)
  .select({ columns: "name", from: "words", where: { name: "unknown" } })
  .execute();
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

Flattens an object deeply (useful for URL search parameters).

- **Example:**

```ts
import { flattenDeep } from "next-era/utils";

flattenDeep({ ancestor: { parent: { child: 1, child: 2 } } });
// { 'ancestor.parent.child': 1, 'ancestor.parent.child': 2 }
```

#### `unflattenDeep`

Restores a deeply flattened object.

- **Example:**

```ts
import { unflattenDeep } from "next-era/utils";

unflattenDeep<ToType>(await props.searchParams);
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

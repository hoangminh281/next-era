# Next Era

Welcome to the Next Era project! This package is a comprehensive library to enhance NextJS framework and so on.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Next Era is a powerful and flexible utility package for enhancing Next.js applications, lodash with improved performance, developer experience, and advanced features. Next Era focuses on the core concepts of NextJS to build from component (CSR) to API routes (SSR/SSG). It offers a suite of fastly and minimalist tools to enhance productivity and streamline workflows.

## Features

- Simple and understand tools.
- On-top built base on NextJS, Vercel and Lodash.
- Optimize fetching by learnt and built in concept of useSWC.

## Installation

Install via npm, yarn or pnpm:

```bash
npm install next-era
# or
yarn add next-era
# or
pnpm add next-era
```

## Usage

### Component (CSR)

#### useActionState

Enhanced useActionState of React to allow update action's state manually by setState function.

- Original:

```ts
import { useActionState } from "react";

const [errorMessage, formAction, isPending] = useActionState(
  authenticate,
  undefined
);
```

- Enhanced:

```ts
import { useActionState } from "next-era/hook";

const [errorMessage, formAction, isPending, setErrorMessage] = useActionState(
  authenticate,
  undefined
); // setErrorMessage function to update errorMessage state
```

#### useBool

Hook to manage boolean state.

- Example:

```ts
import { useBool } from "next-era/hook";

const [isEditing, onEditing, offEditing] = useBool();
```

#### useFetch

Hook to fetch data from API. To use this hook, you need to provide the base URL of the API in config file. If you don't provide, it will throw an error: "Base URL not found.

Please provide by one of ways: Passing 'baseURL' into option of hook's param. Setting 'NEXT_ERA_API_URL' or 'NEXT_PUBLIC_NEXT_ERA_API_URL' (if you're working on NextJS) in '.env' config file.".

The hook's using the concept of useSWC from SWR library, but it's more simple and easy to use. Default configuration of swc is:

```json
{
  "revalidateIfStale": {
    "maxAge": 60, // 60 seconds
    "staleWhileRevalidate": 10 // 10 seconds
  }
}
```

- Example:

```ts
import { useFetch } from "next-era/hook";

const [values, fetchValues] = useFetch<ExampleType[]>(
  UseFetchMethodEnum.GET,
  "/api/example/route",
  {
    formatter: async ({ data }) => {
      return data.map((option) => ({
        label: option.name,
        value: option.id,
      }));
    },
  }
);
```

#### useFormChange

Hook to handle form change event.

Specific for checkbox change event. since checkbox is multichoice checker, the data's passing to handler will be array of string joined by ','.

Example: 3 checkboxes with same name 'animal', have 3 diffence values: 'chicken', 'cow', 'duck', in one group, the handler will be received data => 'chicken,cow,duck' instead of 'chicken' or 'cow' or 'duck' by each change event.

- Example:

```ts
import { useFormChange } from "next-era/hook";

const [onChange] = useFormChange(handleChange);
```

#### useRouter

Enhanced useRouter of next/navigation, the hook's allow to pass a object with path and option to push or convert to string URL by toHref.

The object's path can be a template string with params and searchParams.

- Original: Next's useRouter

- Enhanced

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

### API routes (SSR/SSG)

#### factory

Factory function to create a new instance of a DTO class.

- Example:

```ts
import { Factory } from "next-era/db";

await Factory<ToType>(fromObject).to(toDTO);
await Factory<ToType>(fromArray).toArray(toDTO);
```

#### withSQL

Function to build or execute SQL query, adapted with vercel/postgres. Secured by parameterized params passed into native SQL query.

- Example:

```ts
import { withSQL } from "next-era/db";

withSQL(sqlPlugin)
  .select({ columns: "name", from: "words", where: { name: "unknown" } })
  .execute();
```

#### withTransaction

Around with a try catch block that is able to rollback the transaction. Adapted from vercel/postgres.

- Example:

```ts
import withTransaction from "next-era/db";

withTransaction(sql, sql.query(query, parameterizedValues));
```

### Log

Logger class creates a builder to build log instance, which can be used to log messages to the console.

Log function's able to use template literals.

- Example:

```ts
import { Logger } from "next-era/log";

const { debug } = new Logger(data).groupCollapsed("group label");

debug`doing something`;
debug`done`.groupEnd();
```

### Utilities

#### between

Insert a separator between each element of an array such as ReactNode.

- Example:

```tsx
import { between } from "next-era/utils";

between(
  map(compact(breadcrumbs), (breadcrumb) => (
    <li key={breadcrumb.label} aria-current={breadcrumb.active}>
      {breadcrumb.label}
    </li>
  )),
  (index: number) => (
    <span key={index} className="mx-3 inline-block">
      /
    </span>
  )
);
```

#### defaultsDeep (unmutate)

Left merge objects deeply without mutating original object of Lodash's defaultsDeep.

- Example

```ts
import { defaultsDeep } from "next-era/utils";

defaultsDeep(...flatMap(group)).name;
```

#### flattenDeep

Flatten object deeply. Useful for routing to another path with searchParams like: `https://example.com/route?ancestor.parent.child=1&ancestor.parent.child=2`

- Example

```ts
import { flattenDeep } from "next-era/utils";

flattenDeep({ ancestor: { parent: { child: 1, child: 2 } } }); // {'ancestor.parent.child': 1, 'ancestor.parent.child': 2}
```

#### unflattenDeep

Unflatten object deeply. Useful for extracting searchParams after routing by flattenDeep function.

- Example:

```ts
import { unflattenDeep } from "next-era/utils";

unflattenDeep<ToType>(await props.searchParams); // {ancestor: {parent: {child: 1, child: 2}}}
```

## Contributing

We welcome contributions from the community! To contribute, please follow these steps:

1. Fork the repository: https://github.com/hoangminh281/next-era
2. Create a new branch:
   ```bash
   git checkout -b feature-branch
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Description of your changes"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-branch
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

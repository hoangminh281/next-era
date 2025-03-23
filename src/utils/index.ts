import _ from "lodash";

/**
 * Convert object keys from snakeCase to camelCase.
 * @param obj - The object to process.
 * @returns A new object with camelCase keys.
 */
export function toCamelKey(obj: string | number | null): string | number | null;
export function toCamelKey<T>(obj: Record<string, string | number | null>): T;
export function toCamelKey<T>(
  obj: (string | number | Record<string, string | number | null>)[],
): (string | number | T)[];
export function toCamelKey<T>(
  obj: (string | number | Record<string, string | number | null>)[],
): (string | number | T)[];
export function toCamelKey<T>(
  obj:
    | Record<string, string | number | null>
    | (string | number | Record<string, string | number | null>)[],
): T | (string | number | T)[];
export function toCamelKey<T>(
  obj:
    | string
    | Record<string, string | number | null>
    | (string | number | Record<string, string | number | null>)[],
): string | T | (string | number | T)[];
export function toCamelKey<T>(
  obj:
    | string
    | number
    | Record<string, string | number | null>
    | (string | number | Record<string, string | number | null>)[],
): string | number | T | (string | number | T)[];
export function toCamelKey<T>(
  obj:
    | string
    | number
    | Record<string, string | number | null>
    | (string | number | Record<string, string | number | null>)[],
): string | number | T | (string | number | T)[];
export function toCamelKey<T>(
  obj:
    | null
    | string
    | number
    | Record<string, string | number | null>
    | (string | number | Record<string, string | number | null>)[],
): null | string | number | T | (string | number | T)[] {
  if (_.isNil(obj) || typeof obj !== "object") {
    return obj; // Return the value if it's not an object
  }

  if (_.isArray(obj)) {
    return _.map(obj, toCamelKey) as T[]; // Recursively process arrays
  }

  return _.keys(obj).reduce(
    (result: Record<string, string | number | null>, key) => {
      const camelKey = _.camelCase(key);
      result[camelKey] = toCamelKey(obj[key]); // Recursively process nested objects

      return result;
    },
    {},
  ) as T;
}

/**
 * Insert a separator between each element of an array such as ReactNode.
 * @param array The array to process.
 * @param separator The separator to insert between each element.
 * @returns A new array with the separator inserted between each element.
 */
export function between(
  array: unknown[],
  separator: unknown | ((index: number) => unknown),
) {
  if (array.length < 2) return array; // No need to insert anything

  return _.flatMap(array, (item, index) =>
    index < array.length - 1
      ? [
          item,
          _.isFunction(separator) ? separator(array.length + index) : separator,
        ]
      : [item],
  );
}

/**
 * Left merge objects deeply without mutating original object.
 * @param params The objects to merge.
 * @returns A new object merged deeply.
 */
export function defaultsDeep<T>(...params: T[]) {
  const _params = _.cloneDeep(params);

  return _.defaultsDeep(_params[0], ..._.tail(_params)) as T;
}

function doFlattenDeep(
  result: Record<string, unknown>,
  object?: Partial<Record<string, unknown>>,
  path: string[] = [],
) {
  _.map(object, (value, key) => {
    if (_.isObject(value)) {
      doFlattenDeep(result, value, [...path, key]);
    } else if (!_.isUndefined(value)) {
      result[[...path, key].join(".")] = value;
    }
  });
}

/**
 * Flatten object deeply. Useful for routing to another path with searchParams like: `https://example.com/route?ancestor.parent.child=1&ancestor.parent.child=2`
 * Example:
 * ```ts
 * flattenDeep({ancestor: {parent: {child: 1, child: 2}}}) // {'ancestor.parent.child': 1, 'ancestor.parent.child': 2}
 * ```
 * @param object The object to flatten.
 */
export function flattenDeep(
  object?: Record<string, unknown>,
): Record<string, unknown>;
export function flattenDeep(object?: unknown[]): unknown[];
export function flattenDeep(object?: Record<string, unknown> | unknown[]) {
  if (_.isArray(object)) {
    return _.flattenDeep(_.without(object, undefined));
  }

  const result = {};

  doFlattenDeep(result, object);

  return result;
}

/**
 * Unflatten object deeply. Useful for extracting searchParams after routing by flattenDeep function.
 * Example:
 * ```ts
 * unflattenDeep<ToType>(
 *  await props.searchParams,
 * ); // {ancestor: {parent: {child: 1, child: 2}}}
 * ```
 * @param object The object to unflatten.
 * @returns A new object unflattened deeply.
 */
export function unflattenDeep<T = Record<string, string | number>>(
  object?: Record<string, string | number>,
) {
  const result = {};

  _.map(object, (value, key) => {
    _.set(result, key, value);
  });

  return result as Partial<T>;
}

export function clsx(...args: unknown[]) {
  return _.compact(
    _.flatMapDeep(
      _.map(args, (value) => {
        if (_.isPlainObject(value)) {
          return _.keys(_.pickBy(value as Record<string, unknown>, Boolean));
        }

        return value;
      }),
    ),
  ).join(" ");
}

export function interpolate(regex: RegExp, flag?: string) {
  return {
    template: function (content: string) {
      return {
        compiled: function (value: Record<string, unknown>) {
          const regExp = RegExp(regex, flag);
          const flattenDeepValue = flattenDeep(value);

          _.map([...content.matchAll(regExp)], ([match, ...keys]) => {
            _.map(_.compact(keys), (key) => {
              if (_.isUndefined(flattenDeepValue[key])) {
                return;
              }

              content = _.replace(
                content,
                match,
                String(flattenDeepValue[key]),
              );
            });
          });

          return content;
        },
      };
    },
  };
}

/**
 * Normalize path by replacing backslashes with slashes.
 * @param path The path to normalize.
 * @returns A new path normalized.
 */
export function normalizePath(path: string) {
  return _.replace(path, /\\/g, "/");
}

/**
 * Create a wildcard pattern matcher. Example: `wildcardize("*.js").test("index.js")`
 * @param pattern The wildcard pattern to match.
 * @returns A wildcard pattern matcher.
 */
export function wildcardize(pattern: string) {
  const regex = new RegExp(
    "^" +
      _.escapeRegExp(pattern).replace(/\?/g, ".").replace(/\*/g, ".*") +
      "$",
  );

  return {
    test: function (text: string) {
      return regex.test(text);
    },
  };
}

const utils = {
  between,
  defaultsDeep,
  flattenDeep,
  unflattenDeep,
  clsx,
  interpolate,
  normalizePath,
  wildcardize,
};

export default utils;

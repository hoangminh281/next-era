import {
  camelCase,
  cloneDeep,
  compact,
  flatMap,
  isArray,
  isFunction,
  isNil,
  isObject,
  isPlainObject,
  isUndefined,
  keys,
  defaultsDeep as lodashDefaultsDeep,
  flattenDepth as lodashFlattenDepth,
  map,
  pick,
  pickBy,
  set,
  tail,
  without,
} from "lodash";

/**
 * Convert object keys from snakeCase to camelCase.
 * @param obj - The object to process.
 * @returns A new object with camelCase keys.
 */
export function toCamelKey<T>(
  obj: string | number | null
): string | number | null;
export function toCamelKey<T>(obj: Record<string, string | number | null>): T;
export function toCamelKey<T>(
  obj: Record<string, string | number | null>[]
): T[];
export function toCamelKey<T>(
  obj:
    | Record<string, string | number | null>
    | Record<string, string | number | null>[]
): T | T[];
export function toCamelKey<T>(
  obj:
    | null
    | string
    | number
    | Record<string, string | number | null>
    | Record<string, string | number | null>[]
): null | string | number | T | T[] {
  if (isNil(obj) || typeof obj !== "object") {
    return obj; // Return the value if it's not an object
  }

  if (isArray(obj)) {
    return map(obj, toCamelKey) as T[]; // Recursively process arrays
  }

  return keys(obj).reduce(
    (result: Record<string, string | number | null>, key) => {
      const camelKey = camelCase(key);
      result[camelKey] = toCamelKey(obj[key]); // Recursively process nested objects

      return result;
    },
    {}
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
  separator: unknown | ((index: number) => unknown)
) {
  if (array.length < 2) return array; // No need to insert anything

  return flatMap(array, (item, index) =>
    index < array.length - 1
      ? [
          item,
          isFunction(separator) ? separator(array.length + index) : separator,
        ]
      : [item]
  );
}

/**
 * Left merge objects deeply without mutate original object.
 * @param params The objects to merge.
 * @returns A new object merged deeply.
 */
export function defaultsDeep<T>(...params: T[]) {
  const _params = cloneDeep(params);

  return lodashDefaultsDeep(_params[0], ...tail(_params)) as T;
}

function doFlattenDeep(
  result: Record<string, string | number | undefined>,
  object?: Record<
    string,
    string | number | Record<string, string | number | undefined> | undefined
  >,
  path: string[] = []
) {
  map(object, (value, key) => {
    if (isObject(value)) {
      doFlattenDeep(result, value, [...path, key]);
    } else if (!isUndefined(value)) {
      result[[...path, key].join(".")] = value;
    }
  });
}

/**
 * Flatten object deeply. Useful for routing to another path with searchParams like: https://example.com/route?ancestor.parent.child=1&ancestor.parent.child=2
 * Example:
 * ```ts
 * flattenDeep({ancestor: {parent: {child: 1, child: 2}}}) // {'ancestor.parent.child': 1, 'ancestor.parent.child': 2}
 * ```
 * @param object The object to flatten.
 */
export function flattenDeep(
  object?: Record<
    string,
    string | number | Record<string, string | number | undefined> | undefined
  >
): Record<string, string | number>;
export function flattenDeep(
  object?: (string | number | undefined)[]
): (string | number)[];
export function flattenDeep(
  object?:
    | Record<
        string,
        | string
        | number
        | Record<string, string | number | undefined>
        | undefined
      >
    | (string | number | undefined)[]
) {
  if (isArray(object)) {
    return lodashFlattenDepth(without(object, undefined));
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
  object?: Record<string, string | number>
) {
  const result = {};

  map(object, (value, key) => {
    set(result, key, value);
  });

  return result as Partial<T>;
}

export function clsx(...args: unknown[]) {
  return compact(
    lodashFlattenDepth(
      map(args, (value) => {
        if (isPlainObject(value)) {
          return keys(pickBy(value as Record<string, unknown>, Boolean));
        }

        return value;
      })
    )
  ).join(" ");
}

export default {
  between,
  defaultsDeep,
  flattenDeep,
  unflattenDeep,
  clsx,
};

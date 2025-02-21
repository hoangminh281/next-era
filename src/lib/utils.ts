import {
  cloneDeep,
  flatMap,
  isArray,
  isObject,
  defaultsDeep as lodashDefaultsDeep,
  flattenDepth as lodashFlattenDepth,
  map,
  set,
  tail,
} from "lodash";
import { ReactNode } from "react";

/**
 * Function to replace Lodash's isEmpty for supporting Edge runtime
 * @param value
 * @returns
 */
export function isEmpty(value: unknown) {
  // Check for null or undefined
  if (value == null) {
    return true;
  }

  // Check for arrays and strings (empty if length is 0)
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0;
  }

  // Check for Maps and Sets (empty if size is 0)
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  // Check for plain objects (empty if no own properties)
  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  // For other types (e.g., numbers, functions), it's not "empty"
  return false;
}

export function between(array: ReactNode[], separator: ReactNode) {
  if (array.length < 2) return array; // No need to insert anything

  return flatMap(array, (item, index) =>
    index < array.length - 1 ? [item, separator] : [item]
  );
}

export function defaultsDeep<T>(...params: T[]) {
  const _params = cloneDeep(params);

  return lodashDefaultsDeep(_params[0], ...tail(_params)) as T;
}

export function doFlattenDeep(
  result: Record<string, string | number>,
  object?: Record<string, string | number | Record<string, string | number>>,
  path: string[] = []
) {
  map(object, (value, key) => {
    if (isObject(value)) {
      doFlattenDeep(result, value, [...path, key]);
    } else {
      result[[...path, key].join(".")] = value;
    }
  });
}

export function flattenDeep(
  object?: Record<string, string | number | Record<string, string | number>>
): Record<string, string | number>;
export function flattenDeep(object?: (string | number)[]): (string | number)[];
export function flattenDeep(
  object?:
    | Record<string, string | number | Record<string, string | number>>
    | (string | number)[]
) {
  if (isArray(object)) {
    return lodashFlattenDepth(object);
  }

  const result = {};

  doFlattenDeep(result, object);

  return result;
}

export function unflattenDeep<T = Record<string, string | number>>(
  object?: Record<string, string | number>
) {
  const result = {};

  map(object, (value, key) => {
    set(result, key, value);
  });

  return result as Partial<T>;
}

import { camelCase, cloneDeep, compact, flatMap, isArray, isFunction, isNil, isObject, isPlainObject, isUndefined, keys, defaultsDeep as lodashDefaultsDeep, flattenDepth as lodashFlattenDepth, map, pickBy, set, tail, without, } from "lodash";
export function toCamelKey(obj) {
    if (isNil(obj) || typeof obj !== "object") {
        return obj; // Return the value if it's not an object
    }
    if (isArray(obj)) {
        return map(obj, toCamelKey); // Recursively process arrays
    }
    return keys(obj).reduce((result, key) => {
        const camelKey = camelCase(key);
        result[camelKey] = toCamelKey(obj[key]); // Recursively process nested objects
        return result;
    }, {});
}
/**
 * Insert a separator between each element of an array such as ReactNode.
 * @param array The array to process.
 * @param separator The separator to insert between each element.
 * @returns A new array with the separator inserted between each element.
 */
export function between(array, separator) {
    if (array.length < 2)
        return array; // No need to insert anything
    return flatMap(array, (item, index) => index < array.length - 1
        ? [
            item,
            isFunction(separator) ? separator(array.length + index) : separator,
        ]
        : [item]);
}
/**
 * Left merge objects deeply without mutate original object.
 * @param params The objects to merge.
 * @returns A new object merged deeply.
 */
export function defaultsDeep(...params) {
    const _params = cloneDeep(params);
    return lodashDefaultsDeep(_params[0], ...tail(_params));
}
function doFlattenDeep(result, object, path = []) {
    map(object, (value, key) => {
        if (isObject(value)) {
            doFlattenDeep(result, value, [...path, key]);
        }
        else if (!isUndefined(value)) {
            result[[...path, key].join(".")] = value;
        }
    });
}
export function flattenDeep(object) {
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
export function unflattenDeep(object) {
    const result = {};
    map(object, (value, key) => {
        set(result, key, value);
    });
    return result;
}
export function clsx(...args) {
    return compact(lodashFlattenDepth(map(args, (value) => {
        if (isPlainObject(value)) {
            return keys(pickBy(value, Boolean));
        }
        return value;
    }))).join(" ");
}
export default {
    between,
    defaultsDeep,
    flattenDeep,
    unflattenDeep,
    clsx,
};

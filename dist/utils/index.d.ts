/**
 * Convert object keys from snakeCase to camelCase.
 * @param obj - The object to process.
 * @returns A new object with camelCase keys.
 */
export declare function toCamelKey<T>(obj: string | number | null): string | number | null;
export declare function toCamelKey<T>(obj: Record<string, string | number | null>): T;
export declare function toCamelKey<T>(obj: Record<string, string | number | null>[]): T[];
export declare function toCamelKey<T>(obj: Record<string, string | number | null> | Record<string, string | number | null>[]): T | T[];
/**
 * Insert a separator between each element of an array such as ReactNode.
 * @param array The array to process.
 * @param separator The separator to insert between each element.
 * @returns A new array with the separator inserted between each element.
 */
export declare function between(array: unknown[], separator: unknown | ((index: number) => unknown)): any[];
/**
 * Left merge objects deeply without mutate original object.
 * @param params The objects to merge.
 * @returns A new object merged deeply.
 */
export declare function defaultsDeep<T>(...params: T[]): T;
/**
 * Flatten object deeply. Useful for routing to another path with searchParams like: https://example.com/route?ancestor.parent.child=1&ancestor.parent.child=2
 * Example:
 * ```ts
 * flattenDeep({ancestor: {parent: {child: 1, child: 2}}}) // {'ancestor.parent.child': 1, 'ancestor.parent.child': 2}
 * ```
 * @param object The object to flatten.
 */
export declare function flattenDeep(object?: Record<string, string | number | Record<string, string | number | undefined> | undefined>): Record<string, string | number>;
export declare function flattenDeep(object?: (string | number | undefined)[]): (string | number)[];
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
export declare function unflattenDeep<T = Record<string, string | number>>(object?: Record<string, string | number>): Partial<T>;
export declare function clsx(...args: unknown[]): string;
declare const _default: {
    between: typeof between;
    defaultsDeep: typeof defaultsDeep;
    flattenDeep: typeof flattenDeep;
    unflattenDeep: typeof unflattenDeep;
    clsx: typeof clsx;
};
export default _default;

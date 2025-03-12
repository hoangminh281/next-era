/**
 * Convert object keys from snakeCase to camelCase.
 * @param obj - The object to process.
 * @returns A new object with camelCase keys.
 */
export declare function toCamelKey<T>(obj: string | number | null): string | number | null;
export declare function toCamelKey<T>(obj: Record<string, string | number | null>): T;
export declare function toCamelKey<T>(obj: Record<string, string | number | null>[]): T[];
export declare function toCamelKey<T>(obj: Record<string, string | number | null> | Record<string, string | number | null>[]): T | T[];
export declare function between(array: unknown[], separator: unknown | ((index: number) => unknown)): any[];
export declare function defaultsDeep<T>(...params: T[]): T;
export declare function doFlattenDeep(result: Record<string, string | number | undefined>, object?: Record<string, string | number | Record<string, string | number | undefined> | undefined>, path?: string[]): void;
export declare function flattenDeep(object?: Record<string, string | number | Record<string, string | number | undefined> | undefined>): Record<string, string | number>;
export declare function flattenDeep(object?: (string | number | undefined)[]): (string | number)[];
export declare function unflattenDeep<T = Record<string, string | number>>(object?: Record<string, string | number>): Partial<T>;
declare const _default: {
    between: typeof between;
    defaultsDeep: typeof defaultsDeep;
    flattenDeep: typeof flattenDeep;
    unflattenDeep: typeof unflattenDeep;
};
export default _default;

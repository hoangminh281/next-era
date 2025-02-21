import { ReactNode } from "react";
/**
 * Function to replace Lodash's isEmpty for supporting Edge runtime
 * @param value
 * @returns
 */
export declare function isEmpty(value: unknown): boolean;
export declare function between(array: ReactNode[], separator: ReactNode): ReactNode[];
export declare function defaultsDeep<T>(...params: T[]): T;
export declare function doFlattenDeep(result: Record<string, string | number>, object?: Record<string, string | number | Record<string, string | number>>, path?: string[]): void;
export declare function flattenDeep(object?: Record<string, string | number | Record<string, string | number>>): Record<string, string | number>;
export declare function flattenDeep(object?: (string | number)[]): (string | number)[];
export declare function unflattenDeep<T = Record<string, string | number>>(object?: Record<string, string | number>): Partial<T>;

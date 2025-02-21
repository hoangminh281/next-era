import { Session } from "next-auth";
/**
 * Factory function to create a new instance of a DTO class.
 * @param obj - The object to process.
 * @returns A new DTO class.
 */
export default function Factory<T>(obj: Record<string, string | number | null> | Record<string, string | number | null>[]): {
    to: <K extends {
        auth: () => Promise<Session>;
    } | {}>(ctor: new (obj: T) => K) => Promise<K>;
    toArray: <K extends {
        auth: () => Promise<Session>;
    } | {}>(ctor: new (obj: T) => K) => Promise<Awaited<K>[]>;
    toCamelKey: () => T | T[];
};

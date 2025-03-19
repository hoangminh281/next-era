import { SQLPluginType } from "./lib/definitions.js";
/**
 * Around with a try catch block that is able to rollback the transaction. Adapted from vercel/postgres.
 * @param query - The promise object to query DataBase.
 * @returns A new promise object that is arounded with.
 */
export default function withTransaction<T extends SQLPluginType>(sql: T, query: Promise<{
    rows: any[];
}>): Promise<{
    rows: any[];
}>;

import { SQLPluginType } from "./withSQL/lib/definitions.js";

/**
 * Around with a try catch block that is able to rollback the transaction. Adapted from vercel/postgres.
 * @param query - The promise object to query DataBase.
 * @returns A new promise object that is arounded with.
 */
export default async function withTransaction<T extends SQLPluginType>(
  sql: T,
  query: ReturnType<SQLPluginType["query"]>,
) {
  try {
    await sql.query("BEGIN");
    const result = await query;
    await sql.query("COMMIT");

    return result;
  } catch (e) {
    await sql.query("ROLLBACK");
    throw e;
  }
}

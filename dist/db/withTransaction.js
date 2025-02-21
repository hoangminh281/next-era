/**
 * Around with a try catch block that is able to rollback the transaction.
 * @param query - The promise object to query DataBase.
 * @returns A new promise object that is arounded with.
 */
export default async function withTransaction(sql, query) {
    try {
        await sql.query("BEGIN");
        const result = await query;
        await sql.query("COMMIT");
        return result;
    }
    catch (e) {
        await sql.query("ROLLBACK");
        throw e;
    }
}

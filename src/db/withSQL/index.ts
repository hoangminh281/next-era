import Create from "./create.js";
import Creates from "./creates.js";
import Delete from "./delete.js";
import Deletes from "./deletes.js";
import {
  CreateSchemaType,
  DeleteSchemaType,
  SelectSchemaType,
  SQLPluginType,
  UpdateSchemaType,
} from "./lib/definitions.js";
import Select from "./select.js";
import Update from "./update.js";
import Updates from "./updates.js";

/**
 * Function to build or execute SQL query, adapted from vercel/postgres. Secured by parameterized params passed into native SQL query.
 * Example:
 * ```ts
 * withSQL(sqlPlugin).select({columns: 'name', from: 'words', where: {name: 'unknown'}}).execute()
 * ```
 * @param sql is the SQL plugin to be used, like @vercel/postgres
 * @returns object with select, create, creates, update, updates, delete, deletes functions
 */
export default function withSQL<T extends SQLPluginType>(sql: T) {
  return {
    select: (schema: SelectSchemaType) => {
      const { execute, toRaw } = new Select(sql, schema).build();

      return { execute, toRaw };
    },
    create: (schema: CreateSchemaType) => {
      const { execute, toRaw } = new Create(sql, schema).build();

      return { execute, toRaw };
    },
    creates: (schemas: CreateSchemaType[]) => {
      const { execute, toRaw } = new Creates(sql, schemas).build();

      return { execute, toRaw };
    },
    update: (schema: UpdateSchemaType) => {
      const { execute, toRaw } = new Update(sql, schema).build();

      return { execute, toRaw };
    },
    updates: (schemas: UpdateSchemaType[]) => {
      const { execute, toRaw } = new Updates(sql, schemas).build();

      return { execute, toRaw };
    },
    delete: (schema: DeleteSchemaType) => {
      const { execute, toRaw } = new Delete(sql, schema).build();

      return { execute, toRaw };
    },
    deletes: (schemas: DeleteSchemaType[]) => {
      const { execute, toRaw } = new Deletes(sql, schemas).build();

      return { execute, toRaw };
    },
  };
}

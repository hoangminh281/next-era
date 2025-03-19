import {
  flatMapDeep,
  get,
  isEmpty,
  isObject,
  isString,
  isUndefined,
  keys,
  map,
  nth,
  omitBy,
  snakeCase,
  values,
} from "lodash";
import { Logger } from "../log/index.js";
import {
  CreateSchemaType,
  CreateValuesType,
  DeleteSchemaType,
  GlobalContextType,
  LocalContextType,
  OrderByValueType,
  OrderClauseType,
  SortEnum,
  SQLPluginType,
  UpdateSchemaType,
  UpdateSetType,
  WhereClauseType,
  WhereValueRawType,
  WhereValueType,
} from "./lib/definitions.js";
import withTransaction from "./withTransaction.js";

const WhereClauseFactory = {
  and: (
    data: Record<string, WhereValueType>,
    localContext: LocalContextType,
    globalContext: GlobalContextType
  ) => {
    const { debug } = new Logger(
      data,
      localContext,
      globalContext
    ).groupCollapsed("and");

    debug`Building 'AND' clause`;

    return `(${doBuildWhereClause(data, localContext, globalContext).join(
      " AND "
    )})`;
  },
  or: (
    data: Record<string, WhereValueType>,
    localContext: LocalContextType,
    globalContext: GlobalContextType
  ) => {
    const { debug } = new Logger(
      data,
      localContext,
      globalContext
    ).groupCollapsed("or");

    debug`Building 'OR' clause`;

    return `(${doBuildWhereClause(data, localContext, globalContext).join(
      " OR "
    )})`;
  },
  in: (
    data: string,
    localContext: LocalContextType,
    globalContext: GlobalContextType
  ) => {
    const { debug } = new Logger(
      data,
      localContext,
      globalContext
    ).groupCollapsed("in");

    debug`Building 'IN' clause`;

    globalContext.parameterized.values.push(data);

    return `${snakeCase(
      nth(localContext.keyPath, -2)
    )}::TEXT = ANY(STRING_TO_ARRAY($${
      globalContext.parameterized.values.length
    }, ',')::TEXT[])`;
  },
  isNull: (
    data: WhereClauseType,
    localContext: LocalContextType,
    globalContext: GlobalContextType
  ) => {
    const { debug } = new Logger(
      data,
      localContext,
      globalContext
    ).groupCollapsed("isNull");

    debug`Building 'IS NULL' clause`;

    return `${snakeCase(nth(localContext.keyPath, -2))} IS NULL`;
  },
  ilike: (
    data: string,
    localContext: LocalContextType,
    globalContext: GlobalContextType
  ) => {
    const { debug } = new Logger(
      data,
      localContext,
      globalContext
    ).groupCollapsed("ilike");

    debug`Building 'ILIKE' clause`;

    globalContext.parameterized.values.push(data);

    return `${snakeCase(nth(localContext.keyPath, -2))} ILIKE '%' || $${
      globalContext.parameterized.values.length
    }::text || '%'`;
  },
  raw: (
    data: string | WhereValueRawType,
    localContext: LocalContextType,
    globalContext: GlobalContextType
  ) => {
    const { debug } = new Logger(
      data,
      localContext,
      globalContext
    ).groupCollapsed("raw");

    debug`Building raw clause`;

    let query = data;

    if (isObject(data)) {
      query = data.query;
      globalContext.parameterized.values.push(...data.values);
    }

    return `${snakeCase(nth(localContext.keyPath, -2))} = (${query})`;
  },
  default: (
    data: WhereValueType,
    localContext: LocalContextType,
    globalContext: GlobalContextType
  ) => {
    const { debug } = new Logger(
      data,
      localContext,
      globalContext
    ).groupCollapsed("default");

    debug`Building default clause`;

    if (isObject(data)) {
      debug`Data is object, going to build`;

      return doBuildWhereClause(data, localContext, globalContext);
    }

    debug`Data is not object, building '=' clause`;

    globalContext.parameterized.values.push(data);

    return `${snakeCase(nth(localContext.keyPath, -1))} = $${
      globalContext.parameterized.values.length
    }`;
  },
};

/**
 * Function to build Where clause. Ex: with Where object likes:
 * @param data is the passed data to build, data type accepted by string or object with and/or props or anything else. Ex:
 * `name = (SELECT word.name FROM words as word WHERE word.id = '${id}' AND word.created_by = '${createdBy}') AND created_by = '${createdBy}'`
 * or:
 * {
 *    where: {
 *      or: {
 *        name: {
 *          in: '1,2,3',
 *          isNull: true,
 *          ilike: 'unknown',
 *        }
 *      },
 *      and: {
 *         createdBy,
 *      },
 *    }
 * }
 * or:
 * {
 *    createdBy,
 * }
 * @returns string query. Ex: SELECT word.name FROM words as word WHERE word.id = 'uuid' AND word.created_by = 'date'
 */
const doBuildWhereClause = (
  data: WhereClauseType,
  localContext: LocalContextType,
  globalContext: GlobalContextType
): string[] => {
  const { debug } = new Logger(
    data,
    localContext,
    globalContext
  ).groupCollapsed("doBuildWhereClause");

  debug`Doing build`;

  if (isString(data)) {
    debug`Data is string, return data`.groupEnd();

    return [data];
  }

  if (isObject(data)) {
    debug`Data is object, going to factory`;

    const clauses = flatMapDeep(
      map(omitBy(data, isUndefined), (value, key) => {
        localContext.keyPath.push(key);

        const clause = get(WhereClauseFactory, key, WhereClauseFactory.default)(
          value,
          localContext,
          globalContext
        );

        localContext.keyPath.pop();

        new Logger(data, localContext, globalContext, `\`${clause}\``)
          .debug`Factory did build`.groupEnd();

        return clause;
      })
    );

    debug`Data is built`.groupEnd();

    return clauses;
  }

  debug`Data is not string or object, no build`.groupEnd();

  return [];
};

const buildWhereClause = (
  data: WhereClauseType,
  globalContext: GlobalContextType
) => {
  if (isEmpty(data)) {
    return "";
  }

  const localContext: LocalContextType = { keyPath: [] };

  new Logger(data, localContext, globalContext).groupCollapsed(
    "buildWhereClause"
  ).debug`Starting build`;

  const whereClause = doBuildWhereClause(
    data,
    localContext,
    globalContext
  ).join(" AND ");

  new Logger(data, localContext, globalContext, `\`${whereClause}\``)
    .debug`Ending build`.groupEnd();

  return whereClause ? `WHERE ${whereClause}` : "";
};

const OrderClauseFactory = {
  by: (
    data: string | OrderByValueType,
    localContext: LocalContextType,
    globalContext: GlobalContextType
  ) => {
    const { debug } = new Logger(
      data,
      localContext,
      globalContext
    ).groupCollapsed("by");

    debug`Building 'BY' clause`;

    if (isString(data)) {
      debug`Data is string, return data`;

      return snakeCase(data);
    }
    if (isObject(data)) {
      debug`Data is object, going to build`;

      return doBuildOrderClause(data, localContext, globalContext);
    }
  },
  sort: (
    data: SortEnum,
    localContext: LocalContextType,
    globalContext: GlobalContextType
  ) => {
    const { debug } = new Logger(
      data,
      localContext,
      globalContext
    ).groupCollapsed("sort");

    debug`Building sort clause`;

    return data;
  },
  in: (
    data: string,
    localContext: LocalContextType,
    globalContext: GlobalContextType
  ) => {
    const { debug } = new Logger(
      data,
      localContext,
      globalContext
    ).groupCollapsed("in");

    debug`Building in clause`;

    globalContext.parameterized.values.push(data);

    return `ARRAY_POSITION(STRING_TO_ARRAY($${
      globalContext.parameterized.values.length
    }, ',')::TEXT[], ${snakeCase(nth(localContext.keyPath, -2))}::TEXT)`;
  },
  default: (
    data: OrderClauseType,
    localContext: LocalContextType,
    globalContext: GlobalContextType
  ) => {
    const { debug } = new Logger(
      data,
      localContext,
      globalContext
    ).groupCollapsed("default");

    debug`Building default clause`;

    if (isObject(data)) {
      debug`Data is object, going to build`;

      return doBuildOrderClause(data, localContext, globalContext);
    }

    debug`Data is not object, return column`;

    return nth(localContext.keyPath, -1) || "";
  },
};

const doBuildOrderClause = (
  data: OrderClauseType,
  localContext: LocalContextType,
  globalContext: GlobalContextType
): string[] => {
  const { debug } = new Logger(
    data,
    localContext,
    globalContext
  ).groupCollapsed("doBuildOrderClause");

  debug`Doing build`;

  if (isString(data)) {
    debug`Data is string, return data`.groupEnd();

    return [data];
  }

  if (isObject(data)) {
    debug`Data is object, going to build`;

    const clauses = flatMapDeep(
      map(omitBy(data, isUndefined), (value, key) => {
        localContext.keyPath.push(key);

        const clause = get(OrderClauseFactory, key, OrderClauseFactory.default)(
          value,
          localContext,
          globalContext
        );

        localContext.keyPath.pop();

        new Logger(data, localContext, globalContext, `\`${clause}\``)
          .debug`Factory did build`.groupEnd();

        return clause;
      })
    );

    debug`Data is built`.groupEnd();

    return clauses;
  }

  debug`Data is not string or object, no build`.groupEnd();

  return [];
};

/**
 * Function to build Order clause. Ex: with Order object likes:
 * @param data is the passed data to build, data type accepted by string or object with by/sort props or anything else. Ex:
 * `ORDER BY created_date ASC`
 * or:
 * {
 *    by: {
 *      id: {
 *        in: ids,
 *      },
 *    },
 * }
 * @returns string query. Ex: ORDER BY ARRAY_POSITION(STRING_TO_ARRAY('id1,id2', ',')::TEXT[], id::TEXT)
 */
const buildOrderClause = (
  data: OrderClauseType,
  globalContext: GlobalContextType
) => {
  if (isEmpty(data)) {
    return "";
  }

  const localContext: LocalContextType = { keyPath: [] };

  new Logger(data, localContext, globalContext).groupCollapsed(
    "buildOrderClause"
  ).debug`Starting build`;

  const orderClause = doBuildOrderClause(
    data,
    localContext,
    globalContext
  ).join(" ");

  new Logger(data, localContext, globalContext, `\`${orderClause}\``)
    .debug`Ending build`.groupEnd();

  return orderClause ? `ORDER BY ${orderClause}` : "";
};

const buildColumnClause = (
  data: CreateValuesType,
  globalContext: GlobalContextType
) => {
  if (isEmpty(data)) {
    return "";
  }

  const localContext: LocalContextType = { keyPath: [] };

  new Logger(data, localContext, globalContext).groupCollapsed(
    "buildColumnClause"
  ).debug`Starting build`;

  const columns = keys(omitBy(data, isUndefined)).map(snakeCase);

  const columnClause = `(${columns})`;

  new Logger(data, localContext, globalContext, `\`${columnClause}\``)
    .debug`Ending build`.groupEnd();

  return columnClause;
};

const buildValueClause = (
  data: CreateValuesType,
  globalContext: GlobalContextType
) => {
  if (isEmpty(data)) {
    return "";
  }

  const localContext: LocalContextType = { keyPath: [] };

  new Logger(data, localContext, globalContext).groupCollapsed(
    "buildValueClause"
  ).debug`Starting build`;

  const value = values(omitBy(data, isUndefined)).map((value) => {
    globalContext.parameterized.values.push(value);

    return `$${globalContext.parameterized.values.length}`;
  });

  const valueClause = `VALUES (${value})`;

  new Logger(data, localContext, globalContext, `\`${valueClause}\``)
    .debug`Ending build`.groupEnd();

  return valueClause;
};

const buildSetClause = (
  data: UpdateSetType,
  globalContext: GlobalContextType
) => {
  if (isEmpty(data)) {
    return "";
  }

  const localContext: LocalContextType = { keyPath: [] };

  new Logger(data, localContext, globalContext).groupCollapsed("buildSetClause")
    .debug`Starting build`;

  const sets = map(omitBy(data, isUndefined), (value, key) => {
    globalContext.parameterized.values.push(value);

    return `${snakeCase(key)} = $${globalContext.parameterized.values.length}`;
  });

  const setClause = `SET ${sets}`;

  new Logger(data, localContext, globalContext, `\`${setClause}\``)
    .debug`Ending build`.groupEnd();

  return setClause;
};

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
  const utilities = (query: string, globalContext: GlobalContextType) => {
    query = query.replaceAll(/[ ]{2,}/gm, " ").trim();

    return {
      execute: () => {
        console.log(query, globalContext.parameterized.values);

        if (globalContext.transaction) {
          return withTransaction(
            sql,
            sql.query(query, globalContext.parameterized.values)
          );
        }

        return sql.query(query, globalContext.parameterized.values);
      },
      toRaw: (): WhereValueRawType => {
        return {
          query,
          values: globalContext.parameterized.values,
        };
      },
    };
  };

  return {
    select: (schema: {
      columns: string[] | string;
      from: string;
      where: WhereClauseType;
      order?: OrderClauseType;
      limit?: number;
      offset?: number;
    }) => {
      const { columns, from, where, order, limit, offset } = schema;

      new Logger(schema).groupCollapsed("withSQL")
        .debug`Start building 'select' SQL`;

      const globalContext: GlobalContextType = {
        parameterized: { values: [] },
      };
      const whereClause = buildWhereClause(where, globalContext);
      const orderClause = buildOrderClause(order, globalContext);
      const limitClause = limit ? `LIMIT ${limit}` : "";
      const offsetClause = offset ? `OFFSET ${offset}` : "";
      const query = `SELECT ${columns} FROM ${from} ${whereClause} ${orderClause} ${limitClause} ${offsetClause}`;

      new Logger(schema, `\`${query}\``)
        .debug`Ended building 'select' SQL`.groupEnd();

      return utilities(query, globalContext);
    },
    create: (
      schema: CreateSchemaType,
      globalContext: GlobalContextType | undefined = {
        parameterized: { values: [] },
      }
    ) => {
      const { into, values } = schema;

      new Logger(schema).groupCollapsed("withSQL")
        .debug`Start building 'create' SQL`;
      const columnClause = buildColumnClause(values, globalContext);
      const valueClause = buildValueClause(values, globalContext);
      const query = `INSERT INTO ${into} ${columnClause} ${valueClause} ON CONFLICT (id) DO NOTHING`;

      new Logger(schema, `\`${query}\``)
        .debug`Ended building 'create' SQL`.groupEnd();

      return utilities(query, globalContext);
    },
    creates: (schemas: CreateSchemaType[]) => {
      new Logger(schemas).groupCollapsed("withSQL")
        .debug`Start building 'creates' SQL`;

      const globalContext: GlobalContextType = {
        parameterized: { values: [] },
        transaction: true,
      };
      const query = map(
        schemas,
        (schema) => withSQL(sql).create(schema, globalContext).toRaw().query
      ).join(";");

      new Logger(schemas, `\`${query}\``)
        .debug`Ended building 'creates' SQL`.groupEnd();

      return utilities(query, globalContext);
    },
    update: (
      schema: UpdateSchemaType,
      globalContext: GlobalContextType | undefined = {
        parameterized: { values: [] },
      }
    ) => {
      const { on, set, where } = schema;

      new Logger(schema).groupCollapsed("withSQL")
        .debug`Start building 'update' SQL`;

      const setClause = buildSetClause(set, globalContext);
      const whereClause = buildWhereClause(where, globalContext);
      const query = `UPDATE ${on} ${setClause} ${whereClause}`;

      new Logger(schema, `\`${query}\``)
        .debug`Ended building 'update' SQL`.groupEnd();

      return utilities(query, globalContext);
    },
    updates: (schemas: UpdateSchemaType[]) => {
      new Logger(schemas).groupCollapsed("withSQL")
        .debug`Start building 'updates' SQL`;

      const globalContext: GlobalContextType = {
        parameterized: { values: [] },
        transaction: true,
      };
      const query = map(
        schemas,
        (schema) => withSQL(sql).update(schema, globalContext).toRaw().query
      ).join(";");

      new Logger(schemas, `\`${query}\``)
        .debug`Ended building 'updates' SQL`.groupEnd();

      return utilities(query, globalContext);
    },
    delete: (
      schema: DeleteSchemaType,
      globalContext: GlobalContextType | undefined = {
        parameterized: { values: [] },
      }
    ) => {
      const { from, where } = schema;

      new Logger(schema).groupCollapsed("withSQL")
        .debug`Start building 'delete' SQL`;

      const whereClause = buildWhereClause(where, globalContext);
      const query = `DELETE FROM ${from} ${whereClause}`;

      new Logger(schema, `\`${query}\``)
        .debug`Ended building 'delete' SQL`.groupEnd();

      return utilities(query, globalContext);
    },
    deletes: (schemas: DeleteSchemaType[]) => {
      new Logger(schemas).groupCollapsed("withSQL")
        .debug`Start building 'deletes' SQL`;

      const globalContext: GlobalContextType = {
        parameterized: { values: [] },
        transaction: true,
      };
      const query = map(
        schemas,
        (schema) => withSQL(sql).delete(schema, globalContext).toRaw().query
      ).join(";");

      new Logger(schemas, `\`${query}\``)
        .debug`Ended building 'deletes' SQL`.groupEnd();

      return utilities(query, globalContext);
    },
  };
}

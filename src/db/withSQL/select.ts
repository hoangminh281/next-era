import {
  flatMapDeep,
  get,
  has,
  isEmpty,
  isObject,
  isString,
  isUndefined,
  keys,
  map,
  omitBy,
  values,
} from "lodash";
import { Logger } from "../../log/index.js";
import { snakeCase } from "../../utils/index.js";
import {
  FromClauseType,
  LocalContextType,
  OrderClauseType,
  SelectSchemaType,
  SQLPluginType,
} from "./lib/definitions.js";
import { Factory } from "./lib/factory.js";
import Where from "./where.js";

class Select extends Where {
  #schema: SelectSchemaType;

  constructor(sql: SQLPluginType, schema: SelectSchemaType) {
    super(sql, schema);
    this.#schema = schema;
  }

  #columns() {
    const { columns: column } = this.#schema;
    const columns = isString(column) ? [column] : column;

    new Logger(column, undefined, this._globalContext).groupCollapsed(
      "buildColumnClause",
    ).debug`Starting build`;

    const columnClause = `SELECT ${map(columns, snakeCase)}`;

    new Logger(column, undefined, this._globalContext, `\`${columnClause}\``)
      .debug`Ending build`.groupEnd();

    this._clauses.push(columnClause);

    return this;
  }

  #buildFrom(
    { from }: { from: FromClauseType },
    localContext: LocalContextType,
  ) {
    const { debug } = new Logger(
      from,
      localContext,
      this._globalContext,
    ).groupCollapsed("doBuildFromClause");

    debug`Doing build`;

    if (isObject(from)) {
      debug`From is object`;

      if (has(from, "raw")) {
        debug`From has raw`;

        const { raw, as } = from;
        let query = raw;

        if (isObject(raw)) {
          debug`Raw is object, return from`.groupEnd();

          this._globalContext.parameterized.values.push(...raw.values);

          query = raw.query;
        }

        debug`Raw is string, return from`.groupEnd();
        return `(${query}) ${as || ""}`;
      }

      debug`From has alias, return from`.groupEnd();

      const as = keys(from)[0];
      const table = values(from)[0];

      return `(${snakeCase(table as string)}) ${as || ""}`;
    }

    debug`From is string, return from`.groupEnd();

    return [snakeCase(from)];
  }

  #from() {
    const { from } = this.#schema;

    if (isEmpty(from)) {
      return this;
    }

    const localContext: LocalContextType = { keyPath: [] };

    new Logger(from, localContext, this._globalContext).groupCollapsed(
      "buildFromClause",
    ).debug`Starting build`;

    const fromClause = this.#buildFrom({ from }, localContext);

    new Logger(from, localContext, this._globalContext, `\`${fromClause}\``)
      .debug`Ending build`.groupEnd();

    fromClause && this._clauses.push(`FROM ${fromClause}`);

    return this;
  }

  #join() {
    const { join } = this.#schema;

    if (isEmpty(join)) {
      return this;
    }

    const localContext: LocalContextType = { keyPath: [] };

    new Logger(join, localContext, this._globalContext).groupCollapsed(
      "buildJoinClause",
    ).debug`Starting build`;

    const to = this.#buildFrom({ from: join.to }, localContext);
    const on = isString(join.on)
      ? join.on
      : this._buildWhere({ value: join.on }, localContext).join(" AND ");
    const joinClause = `${join.type} JOIN ${to} ON ${on}`;

    new Logger(join, localContext, this._globalContext, `\`${joinClause}\``)
      .debug`Ending build`.groupEnd();

    joinClause && this._clauses.push(`JOIN ${joinClause}`);

    return this;
  }

  #buildOrder = (
    { value }: { value: OrderClauseType },
    localContext: LocalContextType,
  ) => {
    const { debug } = new Logger(
      value,
      localContext,
      this._globalContext,
    ).groupCollapsed("doBuildOrderClause");

    debug`Doing build`;

    if (isString(value)) {
      debug`Data is string, return data`.groupEnd();

      return [value];
    }

    if (isObject(value)) {
      debug`Data is object, going to build`;

      const clauses = flatMapDeep(
        map(omitBy(value, isUndefined), (value, key) => {
          localContext.keyPath.push(key);

          const clause = get(Factory.order, key, Factory.order.default)(
            { value, build: this.#buildOrder },
            localContext,
            this._globalContext,
          );

          localContext.keyPath.pop();

          new Logger(value, localContext, this._globalContext, `\`${clause}\``)
            .debug`Factory did build`.groupEnd();

          return clause;
        }),
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
  #order() {
    const { order } = this.#schema;

    if (isEmpty(order) || isUndefined(order)) {
      return this;
    }

    const localContext: LocalContextType = { keyPath: [] };

    new Logger(order, localContext, this._globalContext).groupCollapsed(
      "buildOrderClause",
    ).debug`Starting build`;

    const orderClause = this.#buildOrder({ value: order }, localContext).join(
      " ",
    );

    new Logger(order, localContext, this._globalContext, `\`${orderClause}\``)
      .debug`Ending build`.groupEnd();

    orderClause && this._clauses.push(`ORDER BY ${orderClause}`);

    return this;
  }
  #limit() {
    const { limit } = this.#schema;

    new Logger(limit, undefined, this._globalContext).groupCollapsed(
      "buildColumnClause",
    ).debug`Starting build`;

    const limitClause = `LIMIT ${limit}`;

    new Logger(limit, undefined, this._globalContext, `\`${limitClause}\``)
      .debug`Ending build`.groupEnd();

    limit && this._clauses.push(limitClause);

    return this;
  }
  #offset() {
    const { offset } = this.#schema;

    new Logger(offset, undefined, this._globalContext).groupCollapsed(
      "buildColumnClause",
    ).debug`Starting build`;

    const offsetClause = `OFFSET ${offset}`;

    new Logger(offset, undefined, this._globalContext, `\`${offsetClause}\``)
      .debug`Ending build`.groupEnd();

    offset && this._clauses.push(offsetClause);

    return this;
  }

  build() {
    new Logger(this.#schema).groupCollapsed("withSQL")
      .debug`Start building 'select' SQL`;

    this.#columns().#from().#join()._where().#order().#limit().#offset();
    this._query = this._clauses.join(" ");

    new Logger(this.#schema, `\`${this._query}\``)
      .debug`Ended building 'select' SQL`.groupEnd();

    return this;
  }
}

export default Select;

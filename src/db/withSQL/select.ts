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

    this._clauses.push(`SELECT ${map(columns, snakeCase)}`);

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

    if (isString(from)) {
      debug`Data is string, return data`.groupEnd();

      return [from];
    }

    if (has(from, "raw")) {
      const { raw } = from;

      if (isString(raw)) {
        return `(${raw})`;
      }

      this._globalContext.parameterized.values.push(...raw.values);

      return `(${raw.query})`;
    }

    const value = values(from)[0];

    return typeof value === "object" && "as" in value
      ? `${keys(from)[0]} AS ${value.as}`
      : `${keys(from)[0]}`;
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
      : `${keys(join.on)[0]}::TEXT = ${values(join.on)[0]}::TEXT`;
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

    limit && this._clauses.push(`LIMIT ${limit}`);

    return this;
  }
  #offset() {
    const { offset } = this.#schema;

    offset && this._clauses.push(`OFFSET ${offset}`);

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

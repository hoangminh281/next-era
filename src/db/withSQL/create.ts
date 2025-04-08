import {
  isEmpty,
  isUndefined,
  keys,
  values as lodashValues,
  omitBy,
} from "lodash";
import { Logger } from "../../log/index.js";
import { snakeCase } from "../../utils/index.js";
import Base from "./base.js";
import {
  CreateSchemaType,
  GlobalContextType,
  LocalContextType,
  SQLPluginType,
} from "./lib/definitions.js";

class Create extends Base {
  #schema: CreateSchemaType;

  constructor(
    sql: SQLPluginType,
    schema: CreateSchemaType,
    globalContext?: GlobalContextType,
  ) {
    super(sql, globalContext);
    this.#schema = schema;
  }

  #into() {
    const { into } = this.#schema;

    this._clauses.push(`INSERT INTO ${into}`);

    return this;
  }

  #column() {
    const { values } = this.#schema;

    if (isEmpty(values)) {
      return this;
    }

    const localContext: LocalContextType = { keyPath: [] };

    new Logger(values, localContext, this._globalContext).groupCollapsed(
      "buildColumnClause",
    ).debug`Starting build`;

    const columns = keys(omitBy(values, isUndefined)).map(snakeCase);
    const columnClause = `(${columns})`;

    new Logger(values, localContext, this._globalContext, `\`${columnClause}\``)
      .debug`Ending build`.groupEnd();

    columnClause && this._clauses.push(columnClause);

    return this;
  }

  #value() {
    const { values } = this.#schema;

    if (isEmpty(values)) {
      return this;
    }

    const localContext: LocalContextType = { keyPath: [] };

    new Logger(values, localContext, this._globalContext).groupCollapsed(
      "buildValueClause",
    ).debug`Starting build`;

    const value = lodashValues(omitBy(values, isUndefined)).map((value) => {
      this._globalContext.parameterized.values.push(value);

      return `$${this._globalContext.parameterized.values.length}`;
    });

    const valueClause = `VALUES (${value})`;

    new Logger(values, localContext, this._globalContext, `\`${valueClause}\``)
      .debug`Ending build`.groupEnd();

    valueClause && this._clauses.push(valueClause);

    return this;
  }

  #other() {
    this._clauses.push("ON CONFLICT (id) DO NOTHING RETURNING id;");

    return this;
  }

  build() {
    new Logger(this.#schema).groupCollapsed("withSQL")
      .debug`Start building 'create' SQL`;

    this.#into().#column().#value().#other();
    this._query = this._clauses.join(" ");

    new Logger(this.#schema, `\`${this._query}\``)
      .debug`Ended building 'create' SQL`.groupEnd();

    return this;
  }
}

export default Create;

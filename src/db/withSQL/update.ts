import { isEmpty, isUndefined, map, omitBy } from "lodash";
import { Logger } from "../../log/index.js";
import { snakeCase } from "../../utils/index.js";
import {
  GlobalContextType,
  LocalContextType,
  SQLPluginType,
  UpdateSchemaType,
} from "./lib/definitions.js";
import Where from "./where.js";

class Update extends Where {
  #schema: UpdateSchemaType;

  constructor(
    sql: SQLPluginType,
    schema: UpdateSchemaType,
    globalContext?: GlobalContextType,
  ) {
    super(sql, schema, globalContext);
    this.#schema = schema;
  }

  #on() {
    const { on } = this.#schema;

    this._clauses.push(`UPDATE ${on}`);

    return this;
  }

  #set() {
    const { set } = this.#schema;

    if (isEmpty(set)) {
      return this;
    }

    const localContext: LocalContextType = { keyPath: [] };

    new Logger(set, localContext, this._globalContext).groupCollapsed(
      "buildSetClause",
    ).debug`Starting build`;

    const sets = map(omitBy(set, isUndefined), (value, key) => {
      this._globalContext.parameterized.values.push(value);

      return `${snakeCase(key)} = $${this._globalContext.parameterized.values.length}`;
    });

    const setClause = `SET ${sets}`;

    new Logger(set, localContext, this._globalContext, `\`${setClause}\``)
      .debug`Ending build`.groupEnd();

    setClause && this._clauses.push(setClause);

    return this;
  }

  build() {
    new Logger(this.#schema).groupCollapsed("withSQL")
      .debug`Start building 'update' SQL`;

    this.#on().#set()._where();
    this._query = this._clauses.join(" ");

    new Logger(this.#schema, `\`${this._query}\``)
      .debug`Ended building 'update' SQL`.groupEnd();

    return this;
  }
}

export default Update;

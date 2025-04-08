import { Logger } from "../../log/index.js";
import {
  DeleteSchemaType,
  GlobalContextType,
  SQLPluginType,
} from "./lib/definitions.js";
import Where from "./where.js";

class Delete extends Where {
  #schema: DeleteSchemaType;

  constructor(
    sql: SQLPluginType,
    schema: DeleteSchemaType,
    globalContext?: GlobalContextType,
  ) {
    super(sql, schema, globalContext);
    this.#schema = schema;
  }

  #from() {
    const { from } = this.#schema;

    this._clauses.push(`DELETE FROM ${from}`);

    return this;
  }

  build() {
    new Logger(this.#schema).groupCollapsed("withSQL")
      .debug`Start building 'delete' SQL`;

    this.#from()._where();
    this._query = this._clauses.join(" ");

    new Logger(this.#schema, `\`${this._query}\``)
      .debug`Ended building 'delete' SQL`.groupEnd();

    return this;
  }
}

export default Delete;

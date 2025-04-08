import { map } from "lodash";
import { Logger } from "../../log/index.js";
import Base from "./base.js";
import Create from "./create.js";
import { CreateSchemaType, SQLPluginType } from "./lib/definitions.js";

class Creates extends Base {
  #schemas: CreateSchemaType[];

  constructor(sql: SQLPluginType, schemas: CreateSchemaType[]) {
    super(sql);
    this.#schemas = schemas;
  }

  build() {
    new Logger(this.#schemas).groupCollapsed("withSQL")
      .debug`Start building 'creates' SQL`;

    this._query = map(
      this.#schemas,
      (schema) =>
        new Create(this._sql, schema, this._globalContext).build().toRaw()
          .query,
    ).join(";");

    new Logger(this.#schemas, `\`${this._query}\``)
      .debug`Ended building 'creates' SQL`.groupEnd();

    return this;
  }
}

export default Creates;

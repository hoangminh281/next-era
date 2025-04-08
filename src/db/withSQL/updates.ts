import { map } from "lodash";
import { Logger } from "../../log/index.js";
import Base from "./base.js";
import { SQLPluginType, UpdateSchemaType } from "./lib/definitions.js";
import Update from "./update.js";

class Updates extends Base {
  #schemas: UpdateSchemaType[];

  constructor(sql: SQLPluginType, schemas: UpdateSchemaType[]) {
    super(sql);
    this.#schemas = schemas;
  }

  build() {
    new Logger(this.#schemas).groupCollapsed("withSQL")
      .debug`Start building 'updates' SQL`;

    this._query = map(
      this.#schemas,
      (schema) =>
        new Update(this._sql, schema, this._globalContext).build().toRaw()
          .query,
    ).join(";");

    new Logger(this.#schemas, `\`${this._query}\``)
      .debug`Ended building 'updates' SQL`.groupEnd();

    return this;
  }
}

export default Updates;

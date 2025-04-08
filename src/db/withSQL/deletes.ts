import { map } from "lodash";
import { Logger } from "../../log/index.js";
import Base from "./base.js";
import Delete from "./delete.js";
import { DeleteSchemaType, SQLPluginType } from "./lib/definitions.js";

class Deletes extends Base {
  #schemas: DeleteSchemaType[];

  constructor(sql: SQLPluginType, schemas: DeleteSchemaType[]) {
    super(sql);
    this.#schemas = schemas;
  }

  build() {
    new Logger(this.#schemas).groupCollapsed("withSQL")
      .debug`Start building 'deletes' SQL`;

    this._query = map(
      this.#schemas,
      (schema) =>
        new Delete(this._sql, schema, this._globalContext).build().toRaw()
          .query,
    ).join(";");

    new Logger(this.#schemas, `\`${this._query}\``)
      .debug`Ended building 'deletes' SQL`.groupEnd();

    return this;
  }
}

export default Deletes;

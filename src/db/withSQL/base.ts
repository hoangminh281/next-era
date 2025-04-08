import withTransaction from "../withTransaction.js";
import { GlobalContextType, SQLPluginType } from "./lib/definitions.js";

class Base {
  _sql: SQLPluginType;
  _query: string = "";
  _clauses: string[] = [];
  _globalContext: GlobalContextType = {
    parameterized: { values: [] },
  };

  constructor(sql: SQLPluginType, globalContext?: GlobalContextType) {
    this._sql = sql;
    this._globalContext = globalContext ?? this._globalContext;
  }

  set query(query: string) {
    this._query = query.replaceAll(/[ ]{2,}/gm, " ").trim();
  }

  execute = () => {
    console.log(this._query, this._globalContext.parameterized.values);

    if (this._globalContext.transaction) {
      return withTransaction(
        this._sql,
        this._sql.query(this._query, this._globalContext.parameterized.values),
      );
    }

    return this._sql.query(
      this._query,
      this._globalContext.parameterized.values,
    );
  };

  toRaw = () => {
    return {
      query: this._query,
      values: this._globalContext.parameterized.values,
    };
  };
}

export default Base;

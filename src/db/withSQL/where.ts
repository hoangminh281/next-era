import {
  flatMapDeep,
  get,
  isEmpty,
  isObject,
  isString,
  isUndefined,
  map,
  omitBy,
} from "lodash";
import { Logger } from "../../log/index.js";
import Base from "./base.js";
import {
  GlobalContextType,
  LocalContextType,
  SQLPluginType,
  WhereBuildType,
  WhereSchemaType,
} from "./lib/definitions.js";
import { Factory } from "./lib/factory.js";

class Where extends Base {
  #schema: WhereSchemaType;

  constructor(
    sql: SQLPluginType,
    schema: WhereSchemaType,
    globalContext?: GlobalContextType,
  ) {
    super(sql, globalContext);
    this.#schema = schema;
  }

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
  _buildWhere: WhereBuildType = ({ value }, localContext) => {
    const { debug } = new Logger(
      value,
      localContext,
      this._globalContext,
    ).groupCollapsed("doBuildWhereClause");

    debug`Doing build`;

    if (isString(value)) {
      debug`Where is string, return where`.groupEnd();

      return [value];
    }

    if (isObject(value)) {
      debug`Where is object, going to factory`;

      const clauses = flatMapDeep(
        map(omitBy(value, isUndefined), (value, key) => {
          localContext.keyPath.push(key);

          const clause = get(Factory.where, key, Factory.where.default)(
            { value, build: this._buildWhere },
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

  _where() {
    const { where } = this.#schema;

    if (isEmpty(where) || isUndefined(where)) {
      return this;
    }

    const localContext: LocalContextType = { keyPath: [] };

    new Logger(where, localContext, this._globalContext).groupCollapsed(
      "buildWhereClause",
    ).debug`Starting build`;

    const whereClause = this._buildWhere({ value: where }, localContext).join(
      " AND ",
    );

    new Logger(where, localContext, this._globalContext, `\`${whereClause}\``)
      .debug`Ending build`.groupEnd();

    whereClause && this._clauses.push(`WHERE ${whereClause}`);

    return this;
  }
}

export default Where;

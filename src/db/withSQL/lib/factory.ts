import { isObject, isString, nth } from "lodash";
import { Logger } from "../../../log/index.js";
import { snakeCase } from "../../../utils/index.js";
import {
  GlobalContextType,
  LocalContextType,
  OrderBuildType,
  OrderByValueType,
  OrderClauseType,
  RawType,
  SortEnum,
  WhereBuildType,
  WhereClauseType,
  WhereValueType,
} from "./definitions.js";

const where = {
  and: function (
    {
      value,
      build,
    }: { value: Record<string, WhereValueType> } & { build: WhereBuildType },
    localContext: LocalContextType,
    globalContext: GlobalContextType,
  ) {
    const { debug } = new Logger(
      value,
      localContext,
      globalContext,
    ).groupCollapsed("and");

    debug`Building 'AND' clause`;

    return `(${build({ value }, localContext).join(" AND ")})`;
  },
  or: function (
    {
      value,
      build,
    }: { value: Record<string, WhereValueType> } & { build: WhereBuildType },
    localContext: LocalContextType,
    globalContext: GlobalContextType,
  ) {
    const { debug } = new Logger(
      value,
      localContext,
      globalContext,
    ).groupCollapsed("or");

    debug`Building 'OR' clause`;

    return `(${build({ value }, localContext).join(" OR ")})`;
  },
  in: function (
    { value }: { value: string },
    localContext: LocalContextType,
    globalContext: GlobalContextType,
  ) {
    const { debug } = new Logger(
      value,
      localContext,
      globalContext,
    ).groupCollapsed("in");

    debug`Building 'IN' clause`;

    globalContext.parameterized.values.push(value);

    return `${snakeCase(
      nth(localContext.keyPath, -2),
    )}::TEXT = ANY(STRING_TO_ARRAY($${
      globalContext.parameterized.values.length
    }, ',')::TEXT[])`;
  },
  isNull: function (
    { value }: { value: WhereClauseType },
    localContext: LocalContextType,
    globalContext: GlobalContextType,
  ) {
    const { debug } = new Logger(
      value,
      localContext,
      globalContext,
    ).groupCollapsed("isNull");

    debug`Building 'IS NULL' clause`;

    return `${snakeCase(nth(localContext.keyPath, -2))} IS NULL`;
  },
  ilike: function (
    { value }: { value: string },
    localContext: LocalContextType,
    globalContext: GlobalContextType,
  ) {
    const { debug } = new Logger(
      value,
      localContext,
      globalContext,
    ).groupCollapsed("ilike");

    debug`Building 'ILIKE' clause`;

    globalContext.parameterized.values.push(value);

    return `${snakeCase(nth(localContext.keyPath, -2))} ILIKE '%' || $${
      globalContext.parameterized.values.length
    }::text || '%'`;
  },
  raw: function (
    { value }: { value: string | RawType },
    localContext: LocalContextType,
    globalContext: GlobalContextType,
  ) {
    const { debug } = new Logger(
      value,
      localContext,
      globalContext,
    ).groupCollapsed("raw");

    debug`Building raw clause`;

    let query = value;

    if (isObject(value)) {
      query = value.query;
      globalContext.parameterized.values.push(...value.values);
    }

    return `${snakeCase(nth(localContext.keyPath, -2))} = (${query})`;
  },
  default: function (
    { value, build }: { value: WhereValueType } & { build: WhereBuildType },
    localContext: LocalContextType,
    globalContext: GlobalContextType,
  ) {
    const { debug } = new Logger(
      value,
      localContext,
      globalContext,
    ).groupCollapsed("default");

    debug`Building default clause`;

    if (isObject(value)) {
      debug`Data is object, going to build`;

      return build({ value }, localContext);
    }

    debug`Data is not object, building '=' clause`;

    globalContext.parameterized.values.push(value);

    return `${snakeCase(nth(localContext.keyPath, -1))} = $${
      globalContext.parameterized.values.length
    }`;
  },
};

const order = {
  by: function (
    {
      value,
      build,
    }: { value: string | OrderByValueType; build: OrderBuildType },
    localContext: LocalContextType,
    globalContext: GlobalContextType,
  ) {
    const { debug } = new Logger(
      value,
      localContext,
      globalContext,
    ).groupCollapsed("by");

    debug`Building 'BY' clause`;

    if (isString(value)) {
      debug`Data is string, return data`;

      return snakeCase(value);
    }
    if (isObject(value)) {
      debug`Data is object, going to build`;

      return build({ value }, localContext);
    }
  },
  sort: function (
    { value }: { value: SortEnum },
    localContext: LocalContextType,
    globalContext: GlobalContextType,
  ) {
    const { debug } = new Logger(
      value,
      localContext,
      globalContext,
    ).groupCollapsed("sort");

    debug`Building sort clause`;

    return value;
  },
  in: function (
    { value }: { value: string },
    localContext: LocalContextType,
    globalContext: GlobalContextType,
  ) {
    const { debug } = new Logger(
      value,
      localContext,
      globalContext,
    ).groupCollapsed("in");

    debug`Building in clause`;

    globalContext.parameterized.values.push(value);

    return `ARRAY_POSITION(STRING_TO_ARRAY($${
      globalContext.parameterized.values.length
    }, ',')::TEXT[], ${snakeCase(nth(localContext.keyPath, -2))}::TEXT)`;
  },
  default: function (
    { value, build }: { value: OrderClauseType; build: OrderBuildType },
    localContext: LocalContextType,
    globalContext: GlobalContextType,
  ) {
    const { debug } = new Logger(
      value,
      localContext,
      globalContext,
    ).groupCollapsed("default");

    debug`Building default clause`;

    if (isObject(value)) {
      debug`Data is object, going to build`;

      return build({ value }, localContext);
    }

    debug`Data is not object, return column`;

    return nth(localContext.keyPath, -1) || "";
  },
};

export const Factory = {
  where,
  order,
};

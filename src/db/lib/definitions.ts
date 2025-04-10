import { isObject } from "lodash";

//================================================ withSQL ================================================//
export type SQLPluginType = {
  query: (
    query: string,
    values?: GlobalContextParameterizedValueType[],
  ) => Promise<{
    rows: { [column: string]: string | number }[];
  }>;
};

export type GlobalContextParameterizedValueType =
  | string
  | string[]
  | number
  | undefined
  | null;

export type GlobalContextType = {
  parameterized: { values: GlobalContextParameterizedValueType[] };
  transaction?: boolean;
};

export type LocalContextType = {
  keyPath: string[];
};

export type WhereValueRawType = {
  query: string;
  values: GlobalContextParameterizedValueType[];
};

export type WhereValueType =
  | string
  | number
  | undefined
  | null
  | Partial<{
      in: string;
      isNull: boolean;
      ilike: string;
      raw: string | WhereValueRawType;
    }>;

export type WhereClauseType =
  | string
  | (Partial<{
      and: Record<string, WhereValueType>;
      or: Record<string, WhereValueType>;
    }> &
      Record<string, WhereValueType>);

export enum SortEnum {
  Asc = "ASC",
  Desc = "DESC",
}

export type OrderByValueType = Record<
  string,
  {
    in: string | undefined;
  }
>;

export type OrderClauseType =
  | string
  | Partial<{
      by: string | OrderByValueType;
      sort?: SortEnum;
    }>
  | undefined;

export type CreateValuesType = Record<
  string,
  string | number | undefined | null
>;

export type CreateSchemaType = {
  into: string;
  values: CreateValuesType;
};

export type UpdateSetType = Record<string, string | number | undefined | null>;

export type UpdateSchemaType = {
  on: string;
  set: UpdateSetType;
  where: WhereClauseType;
};

export type DeleteSchemaType = { from: string; where: WhereClauseType };
//================================================ End withSQL ================================================//

//================================================ Factory ================================================//
export enum NeonDBErrorCodeEnum {
  NotFound = "22P02",
}

export enum DBErrorCodeEnum {
  NotFound = "404",
}

export class DBError extends Error {
  code?: DBErrorCodeEnum;

  constructor(
    data: string | { message: string; code: DBErrorCodeEnum },
    code?: DBErrorCodeEnum,
  ) {
    super(isObject(data) ? data.message : data);
    this.code = isObject(data) ? data.code : code;
    this.name = "DBError";
  }

  static of(data: unknown, code?: DBErrorCodeEnum) {
    return new DBError(
      data as string | { message: string; code: DBErrorCodeEnum },
      code,
    );
  }
}
//================================================ End Factory ================================================//

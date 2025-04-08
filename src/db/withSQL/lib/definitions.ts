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

export type WhereSchemaType = {
  where: WhereClauseType;
};

export type SelectSchemaType = {
  columns: string[] | string;
  from: FromClauseType;
  join?: JoinClauseType;
  order?: OrderClauseType;
  limit?: number;
  offset?: number;
} & WhereSchemaType;

export type TableClauseType =
  | string
  | ({
      raw: string | RawType;
    } & { [table in Exclude<string, "raw">]: { as: string } });

export type FromClauseType = TableClauseType;

export enum JoinTypeEnum {
  Left = "LEFT",
  Inner = "INNER",
  Right = "RIGHT",
  Full = "FULL",
}

export type JoinClauseType = {
  type: JoinTypeEnum;
  to: TableClauseType;
  on: string | { [fromColumn: string]: string };
};

export type RawType = {
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
      raw: string | RawType;
    }>;

export type WhereClauseType =
  | string
  | (Partial<{
      and: { [column: string]: WhereValueType };
      or: { [column: string]: WhereValueType };
    }> & { [column: string]: WhereValueType });

export type WhereBuildType = (
  options: { value: WhereClauseType },
  localContext: LocalContextType,
) => string[];

export enum SortEnum {
  Asc = "ASC",
  AscNullsFirst = "ASC NULLS FIRST",
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
    }>;

export type OrderBuildType = (
  options: { value: OrderClauseType },
  localContext: LocalContextType,
) => string[];

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
} & WhereSchemaType;

export type DeleteSchemaType = { from: string } & WhereSchemaType;

import { isObject } from "lodash";

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

export * from "../withSQL/lib/definitions.js";

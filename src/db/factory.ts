import { isFunction, isNil } from "lodash";
import { Session } from "next-auth";
import { toCamelKey } from "../utils/index.js";
import { DBError, DBErrorCodeEnum } from "./lib/definitions.js";

/**
 * Factory function to create a new instance of a DTO class.
 * @param obj - The object to process.
 * @returns A new DTO class.
 */
export default function Factory<T>(
  obj:
    | string
    | number
    | Record<string, string | number | null>
    | (string | number | Record<string, string | number | null>)[],
) {
  const entity = toCamelKey<T>(obj);

  return {
    to: async <K extends { auth: () => Promise<Session> } | object>(
      ctor: new (obj: T) => K,
    ) => {
      if (isNil(entity)) {
        throw new DBError(
          "Entity could not be found",
          DBErrorCodeEnum.NotFound,
        );
      }

      const instance = new ctor(entity as T);

      if ("auth" in instance && isFunction(instance.auth)) {
        await instance.auth();
      }

      return instance;
    },
    toArray: async <K extends { auth: () => Promise<Session> } | object>(
      ctor: new (obj: T) => K,
    ) => {
      return await Promise.all(
        (entity as T[]).map(async (o) => {
          const instance = new ctor(o);

          if ("auth" in instance && isFunction(instance.auth)) {
            await instance.auth();
          }

          return instance;
        }),
      );
    },
    toCamelKey: () => entity,
  };
}

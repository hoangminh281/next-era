import { toCamelKey } from "../utils/index.js";
import { isFunction, isNil } from "lodash";
import { DBError, DBErrorCodeEnum } from "./lib/definitions.js";
/**
 * Factory function to create a new instance of a DTO class.
 * @param obj - The object to process.
 * @returns A new DTO class.
 */
export default function Factory(obj) {
    const entity = toCamelKey(obj);
    return {
        to: async (ctor) => {
            if (isNil(entity)) {
                throw new DBError("Entity could not be found", DBErrorCodeEnum.NotFound);
            }
            const instance = new ctor(entity);
            if ("auth" in instance && isFunction(instance.auth)) {
                await instance.auth();
            }
            return instance;
        },
        toArray: async (ctor) => {
            return await Promise.all(entity.map(async (o) => {
                const instance = new ctor(o);
                if ("auth" in instance && isFunction(instance.auth)) {
                    await instance.auth();
                }
                return instance;
            }));
        },
        toCamelKey: () => entity,
    };
}

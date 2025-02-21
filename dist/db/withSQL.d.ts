import { CreateSchemaType, DeleteSchemaType, GlobalContextType, OrderClauseType, SQLPluginType, UpdateSchemaType, WhereClauseType, WhereValueRawType } from "./lib/definitions.js";
export default function withSQL<T extends SQLPluginType>(sql: T): {
    select: (schema: {
        columns: string[] | string;
        from: string;
        where: WhereClauseType;
        order?: OrderClauseType;
        limit?: number;
        offset?: number;
    }) => {
        execute: () => Promise<{
            rows: any[];
        }>;
        toRaw: () => WhereValueRawType;
    };
    create: (schema: CreateSchemaType, globalContext?: GlobalContextType | undefined) => {
        execute: () => Promise<{
            rows: any[];
        }>;
        toRaw: () => WhereValueRawType;
    };
    creates: (schemas: CreateSchemaType[]) => {
        execute: () => Promise<{
            rows: any[];
        }>;
        toRaw: () => WhereValueRawType;
    };
    update: (schema: UpdateSchemaType, globalContext?: GlobalContextType | undefined) => {
        execute: () => Promise<{
            rows: any[];
        }>;
        toRaw: () => WhereValueRawType;
    };
    updates: (schemas: UpdateSchemaType[]) => {
        execute: () => Promise<{
            rows: any[];
        }>;
        toRaw: () => WhereValueRawType;
    };
    delete: (schema: DeleteSchemaType, globalContext?: GlobalContextType | undefined) => {
        execute: () => Promise<{
            rows: any[];
        }>;
        toRaw: () => WhereValueRawType;
    };
    deletes: (schemas: DeleteSchemaType[]) => {
        execute: () => Promise<{
            rows: any[];
        }>;
        toRaw: () => WhereValueRawType;
    };
};

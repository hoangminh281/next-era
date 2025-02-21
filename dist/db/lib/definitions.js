import { isObject } from "lodash";
export var SortEnum;
(function (SortEnum) {
    SortEnum["Asc"] = "ASC";
    SortEnum["Desc"] = "DESC";
})(SortEnum || (SortEnum = {}));
//================================================ End withSQL ================================================//
//================================================ Factory ================================================//
export var NeonDBErrorCodeEnum;
(function (NeonDBErrorCodeEnum) {
    NeonDBErrorCodeEnum["NotFound"] = "22P02";
})(NeonDBErrorCodeEnum || (NeonDBErrorCodeEnum = {}));
export var DBErrorCodeEnum;
(function (DBErrorCodeEnum) {
    DBErrorCodeEnum["NotFound"] = "404";
})(DBErrorCodeEnum || (DBErrorCodeEnum = {}));
export class DBError extends Error {
    code;
    constructor(data, code) {
        super(isObject(data) ? data.message : data);
        this.code = isObject(data) ? data.code : code;
        this.name = "DBError";
    }
    static of(data, code) {
        return new DBError(data, code);
    }
}
//================================================ End Factory ================================================//

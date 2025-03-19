import { isFunction, map } from "lodash";
/**
 * Logger class creates a builder to build log instance, which can be used to log messages to the console.
 * Log function's able to use template literals.
 * Example:
 * ```ts
 * const { debug } = new Logger(data).groupCollapsed("group label");
 * debug`doing something`;
 * debug `done`.groupEnd();
 * ```
 */
export class Logger {
    #context;
    constructor(...context) {
        this.#context = context;
    }
    #log = (context, strings, ...values) => {
        const messages = [strings[0]];
        map(values, (value, index) => {
            messages.push(value, strings[index + 1]);
        });
        return [
            messages.join(""),
            ...map(context, (attr) => (isFunction(attr) ? attr() : attr)),
        ];
    };
    clear = () => {
        console.clear();
        return this;
    };
    group = (...label) => {
        console.group(...label);
        return this;
    };
    groupCollapsed = (...label) => {
        console.groupCollapsed(...label);
        return this;
    };
    log = (strings, ...values) => {
        console.log(...this.#log(this.#context, strings, ...values));
        return this;
    };
    trace = (strings, ...values) => {
        console.trace(...this.#log(this.#context, strings, ...values));
        return this;
    };
    info = (strings, ...values) => {
        console.info(...this.#log(this.#context, strings, ...values));
        return this;
    };
    debug = (strings, ...values) => {
        console.debug(...this.#log(this.#context, strings, ...values));
        return this;
    };
    warn = (strings, ...values) => {
        console.warn(...this.#log(this.#context, strings, ...values));
        return this;
    };
    error = (strings, ...values) => {
        console.error(...this.#log(this.#context, strings, ...values));
        return this;
    };
    groupEnd = () => {
        console.groupEnd();
        return this;
    };
}

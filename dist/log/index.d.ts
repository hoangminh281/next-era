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
export declare class Logger {
    #private;
    constructor(...context: unknown[]);
    clear: () => this;
    group: (...label: string[]) => this;
    groupCollapsed: (...label: string[]) => this;
    log: (strings: TemplateStringsArray, ...values: unknown[]) => this;
    trace: (strings: TemplateStringsArray, ...values: unknown[]) => this;
    info: (strings: TemplateStringsArray, ...values: unknown[]) => this;
    debug: (strings: TemplateStringsArray, ...values: unknown[]) => this;
    warn: (strings: TemplateStringsArray, ...values: unknown[]) => this;
    error: (strings: TemplateStringsArray, ...values: unknown[]) => this;
    groupEnd: () => this;
}

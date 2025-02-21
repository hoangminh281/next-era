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

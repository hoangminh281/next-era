import { isFunction, map } from "lodash";

export class Logger {
  #context: unknown[];

  constructor(...context: unknown[]) {
    this.#context = context;
  }

  #log = (
    context: unknown[],
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => {
    const messages: unknown[] = [strings[0]];

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

  group = (...label: string[]) => {
    console.group(...label);

    return this;
  };

  groupCollapsed = (...label: string[]) => {
    console.groupCollapsed(...label);

    return this;
  };

  log = (strings: TemplateStringsArray, ...values: unknown[]) => {
    console.log(...this.#log(this.#context, strings, ...values));

    return this;
  };

  trace = (strings: TemplateStringsArray, ...values: unknown[]) => {
    console.trace(...this.#log(this.#context, strings, ...values));

    return this;
  };

  info = (strings: TemplateStringsArray, ...values: unknown[]) => {
    console.info(...this.#log(this.#context, strings, ...values));

    return this;
  };

  debug = (strings: TemplateStringsArray, ...values: unknown[]) => {
    console.debug(...this.#log(this.#context, strings, ...values));

    return this;
  };

  warn = (strings: TemplateStringsArray, ...values: unknown[]) => {
    console.warn(...this.#log(this.#context, strings, ...values));

    return this;
  };

  error = (strings: TemplateStringsArray, ...values: unknown[]) => {
    console.error(...this.#log(this.#context, strings, ...values));

    return this;
  };

  groupEnd = () => {
    console.groupEnd();

    return this;
  };
}

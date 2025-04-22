export type TemplateType<I, O> = {
  test: {
    label?: string;
    config: {
      concurrency: boolean;
    };
    context: Record<string, unknown>;
    cases: {
      label?: string;
      input: I | ((fn: (...params: unknown[]) => unknown) => O);
      output: O;
    }[];
  };
};

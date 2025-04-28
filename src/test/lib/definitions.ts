export type TemplateType<I, O> = {
  test: {
    label?: string;
    config: {
      concurrency: boolean;
    };
    context: Record<string, unknown>;
    cases: {
      label?: string;
      assert?: {
        method:
          | "equal"
          | "strictEqual"
          | "deepEqual"
          | "deepStrictEqual"
          | "partialDeepStrictEqual"
          | "notDeepEqual"
          | "match"
          | "doesNotMatch"
          | "doesNotReject"
          | "doesNotThrow"
          | "fail"
          | "ok"
          | "ifError";
        message: string;
      };
      input: I | ((fn: (...params: unknown[]) => unknown) => O);
      output: O;
    }[];
  };
};

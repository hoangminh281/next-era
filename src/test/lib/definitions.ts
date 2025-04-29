type TemplateAssertType = {
  method: // reference: https://nodejs.org/api/assert.html
  | "equal" // ==
    | "strictEqual" // ===
    | "deepStrictEqual" // deep compare with ===
    | "partialDeepStrictEqual" // only deep compare on existed `expected` params
    | "notStrictEqual"
    | "notDeepStrictEqual"
    | "match" // compare with regex
    | "doesNotMatch"
    | "doesNotReject"
    | "doesNotThrow"
    | "fail"
    | "ok" // fail if not truthy
    | "ifError"; // fail if not undefined or null
  message?: string;
};

export type TemplateType<I, O> = {
  test: {
    label?: string;
    config: {
      concurrency: boolean;
    };
    context?: Record<string, unknown>;
    assert?: TemplateAssertType;
    cases: {
      label?: string;
      assert?: TemplateAssertType;
      input: I | ((fn: (...params: unknown[]) => unknown) => O);
      expected: O;
    }[];
  };
};

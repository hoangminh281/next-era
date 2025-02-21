import { useCallback, useState } from "react";

export const useBool = (
  defaultValue = false,
): [
  boolean,
  () => void,
  () => void,
  () => void,
  (isToggle: boolean) => void,
] => {
  const [value, setValue] = useState(!!defaultValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((x) => !x), []);

  return [value, setTrue, setFalse, toggle, setValue];
};

export default useBool;

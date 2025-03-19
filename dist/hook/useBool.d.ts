/**
 * Hook to manage boolean state.
 * @param defaultValue default value of the boolean state
 * @returns boolean state, setTrue, setFalse, toggle, setValue
 */
export declare const useBool: (defaultValue?: boolean) => [boolean, () => void, () => void, () => void, (isToggle: boolean) => void];
export default useBool;

import { UseFormChangeHandlerType } from "./lib/definitions.js";
declare const useFormChange: (handler: (data: UseFormChangeHandlerType) => void) => ((event: React.FormEvent<HTMLFormElement>) => void)[];
export default useFormChange;

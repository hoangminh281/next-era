import { UseFormChangeHandlerType } from "./lib/definitions.js";
/**
 * Hook to handle form change event.
 * Specific for checkbox change event. since checkbox is multichoice checker, the data's passing to handler will be array of string joined by ','.
 * Example: 3 checkbox with same name 'animal', have 3 diffence value: 'chicken', 'cow', 'duck', in one group, the handler will be received data => 'chicken,cow,duck' instead of 'chicken' or 'cow' or 'duck' by each change event.
 * @param handler handler function to handle form change event
 * @returns onChange event handler
 */
declare const useFormChange: (handler: (data: UseFormChangeHandlerType) => void) => ((event: React.FormEvent<HTMLFormElement>) => void)[];
export default useFormChange;

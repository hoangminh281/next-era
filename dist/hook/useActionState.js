import { useActionState as useActionStateReact, useEffect, useState, } from "react";
/**
 * Enhanced useActionState to allow update state manually by setState function.
 * @param query - The promise object to query DataBase.
 * @returns A new promise object that is arounded with.
 */
const useActionState = (action, initialState, permalink) => {
    const [state, formAction, isPending] = useActionStateReact(action, initialState, permalink);
    const [customState, setCustomState] = useState(state);
    useEffect(() => {
        setCustomState(state);
    }, [state]);
    return [customState, formAction, isPending, setCustomState];
};
export default useActionState;

import { useActionState as useActionStateReact, useEffect, useState, } from "react";
/**
 * Enhanced useActionState of React to allow update action's state manually by setState function.
 * @param action action function to dispatch form's data
 * @param initialState initial state of the form
 * @param permalink permalink of the form
 * @returns state, dispatch, isPending, setState
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

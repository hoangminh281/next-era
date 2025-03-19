import { Dispatch, SetStateAction } from "react";
/**
 * Enhanced useActionState of React to allow update action's state manually by setState function.
 * @param action action function to dispatch form's data
 * @param initialState initial state of the form
 * @param permalink permalink of the form
 * @returns state, dispatch, isPending, setState
 */
declare const useActionState: <State, Payload>(action: (state: Awaited<State>, payload: Payload) => State | Promise<State>, initialState: Awaited<State>, permalink?: string) => [state: Awaited<State>, dispatch: (payload: Payload) => void, isPending: boolean, setState: Dispatch<SetStateAction<Awaited<State>>>];
export default useActionState;

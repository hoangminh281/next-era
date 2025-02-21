import {
  Dispatch,
  SetStateAction,
  useActionState as useActionStateReact,
  useEffect,
  useState,
} from "react";

/**
 * Enhanced useActionState to allow update state manually by setState function.
 * @param query - The promise object to query DataBase.
 * @returns A new promise object that is arounded with.
 */
const useActionState = <State, Payload>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string,
): [
  state: Awaited<State>,
  dispatch: (payload: Payload) => void,
  isPending: boolean,
  setState: Dispatch<SetStateAction<Awaited<State>>>,
] => {
  const [state, formAction, isPending] = useActionStateReact(
    action,
    initialState,
    permalink,
  );
  const [customState, setCustomState] = useState(state);

  useEffect(() => {
    setCustomState(state);
  }, [state]);

  return [customState, formAction, isPending, setCustomState];
};

export default useActionState;

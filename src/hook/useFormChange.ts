import { split, toString, uniq, without } from "lodash";
import { useCallback } from "react";
import { UseFormChangeHandlerType } from "./lib/definitions.js";

/**
 * Hook to handle form change event.
 * Specific for checkbox change event. since checkbox is multichoice checker, the data's passing to handler will be array of string joined by ','.
 * Example: 3 checkboxes with same name 'animal', have 3 diffence values: 'chicken', 'cow', 'duck', in one group, the handler will be received data => 'chicken,cow,duck' instead of 'chicken' or 'cow' or 'duck' by each change event.
 * @param handler handler function to handle form change event
 * @returns onChange event handler
 */
const useFormChange = (handler: (data: UseFormChangeHandlerType) => void) => {
  const onChange = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const target = event.target as HTMLFormElement;

      handler({
        event: {
          ...event,
          target,
        },
        name: target.name.replace(/\-.*$/g, ""),
        type: target.type,
        checked: target.checked,
        value: (defaultValue) => {
          let value = target.value;

          switch (target.type) {
            case "checkbox": {
              if (target.checked) {
                value = toString(
                  uniq(
                    without(
                      [...split(defaultValue, ","), value],
                      undefined,
                      null,
                      "",
                    ),
                  ),
                );
              } else {
                value = toString(
                  uniq(
                    without(
                      split(defaultValue, ","),
                      value,
                      undefined,
                      null,
                      "",
                    ),
                  ),
                );
              }
            }
          }

          return value;
        },
      });
    },
    [handler],
  );

  return [onChange];
};

export default useFormChange;

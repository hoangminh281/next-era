import { split, uniq, without } from "lodash";
import { useCallback } from "react";
import { UseFormChangeHandlerType } from "./lib/definitions.js";

const useFormChange = (handler: (data: UseFormChangeHandlerType) => void) => {
  const onChange = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const target = event.target as HTMLFormElement;

      handler({
        event: {
          ...event,
          target: target,
        },
        name: target.name.replace(/\-.*$/g, ""),
        type: target.type,
        checked: target.checked,
        value: (defaultValue) => {
          let value = target.value;

          switch (target.type) {
            case "checkbox": {
              if (target.checked) {
                value = uniq(
                  without(
                    [...split(String(defaultValue), ","), value],
                    undefined,
                    null,
                    ""
                  )
                );
              } else {
                value = uniq(
                  without(
                    split(String(defaultValue), ","),
                    value,
                    undefined,
                    null,
                    ""
                  )
                );
              }
            }
          }

          return value;
        },
      });
    },
    [handler]
  );

  return [onChange];
};

export default useFormChange;

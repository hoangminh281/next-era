import { split, uniq, without } from "lodash";
import { useCallback } from "react";
/**
 * Hook to handle form change event.
 * Specific for checkbox change event. since checkbox is multichoice checker, the data's passing to handler will be array of string joined by ','.
 * Example: 3 checkbox with same name 'animal', have 3 diffence value: 'chicken', 'cow', 'duck', in one group, the handler will be received data => 'chicken,cow,duck' instead of 'chicken' or 'cow' or 'duck' by each change event.
 * @param handler handler function to handle form change event
 * @returns onChange event handler
 */
const useFormChange = (handler) => {
    const onChange = useCallback((event) => {
        const target = event.target;
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
                            value = uniq(without([...split(String(defaultValue), ","), value], undefined, null, ""));
                        }
                        else {
                            value = uniq(without(split(String(defaultValue), ","), value, undefined, null, ""));
                        }
                    }
                }
                return value;
            },
        });
    }, [handler]);
    return [onChange];
};
export default useFormChange;

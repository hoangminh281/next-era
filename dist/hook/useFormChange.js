import { split, uniq, without } from "lodash";
import { useCallback } from "react";
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

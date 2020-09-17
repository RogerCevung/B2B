import * as React from "react";

export interface DisablerContextData {
    disable?: boolean;
}

const DisablerContext = React.createContext<DisablerContextData>({ disable: false });

export interface HasDisablerContext {
    disable: DisablerContextData;
}

export function withDisabler<P extends HasDisablerContext>(Component: React.ComponentType<P>) {
    return function DisableableComponent(props: Pick<P, Exclude<keyof P, keyof HasDisablerContext>>) {
        return (
            <DisablerContext.Consumer>
                {DisablerContextData => (
                    <Component
                        {...(props as P)}
                        // eslint-disable-next-line no-unneeded-ternary
                        disable={DisablerContextData && DisablerContextData.disable ? true : false}
                    />
                )}
            </DisablerContext.Consumer>
        );
    };
}

export default DisablerContext;

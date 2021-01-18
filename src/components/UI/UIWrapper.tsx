import { h } from "preact";
import type { JSX } from "preact";

interface UIWrapperProps {
    children: (JSX.Element | false)[];
}

export const UIWrapper = ({ children }: UIWrapperProps) => {
    return <div className="uiWrapper">{children}</div>;
};

import { h } from "preact";
import type { JSX } from "preact";

export { RefreshButton } from "./RefreshButton";
export { ShowInfoButton } from "./ShowInfoButton";

interface UIWrapperProps {
    children: JSX.Element[];
}

export const UIWrapper = ({ children }: UIWrapperProps) => {
    return <div className="uiWrapper">{children}</div>;
};

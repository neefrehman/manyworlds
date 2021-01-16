import { h } from "preact";
import type { JSX } from "preact";

export { Scene } from "./Scene";

interface SceneWrapperProps {
    children?: JSX.Element;
    onClick: () => void;
}

export const SceneWrapper = ({ children, onClick }: SceneWrapperProps) => {
    return (
        <div onClick={() => onClick()} className="sceneWrapper">
            {children}
        </div>
    );
};

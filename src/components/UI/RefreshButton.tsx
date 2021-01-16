import { h } from "preact";
import type { StateUpdater } from "preact/hooks";

interface RefreshButtonProps {
    onClick: StateUpdater<{}>;
}

export const RefreshButton = ({ onClick }: RefreshButtonProps) => {
    return (
        <button className="uiButton refreshButton" tabIndex={0} onClick={onClick}>
            new world
        </button>
    );
};

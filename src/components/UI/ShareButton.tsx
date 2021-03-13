import { h } from "preact";
import type { StateUpdater } from "preact/hooks";

interface ShareButtonProps {
    onClick: StateUpdater<{}>;
}

export const ShareButton = ({ onClick }: ShareButtonProps) => {
    return (
        <button className="uiButton nudgeDown" tabIndex={0} onClick={onClick}>
            share world
        </button>
    );
};

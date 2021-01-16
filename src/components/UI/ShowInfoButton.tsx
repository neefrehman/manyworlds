import { h } from "preact";
import { useEffect } from "preact/hooks";
import type { StateUpdater } from "preact/hooks";

interface ShowInfoButtonProps {
    infoIsVisible: boolean;
    setInfoIsVisible: StateUpdater<boolean>;
}

export const ShowInfoButton = ({
    infoIsVisible,
    setInfoIsVisible,
}: ShowInfoButtonProps) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setInfoIsVisible(false);
        };

        if (infoIsVisible) document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [infoIsVisible]);

    return (
        <div>
            <button
                id="infoButton"
                className="uiButton infoButton"
                aria-label="info"
                aria-expanded={infoIsVisible}
                tabIndex={0}
                onClick={() =>
                    setInfoIsVisible(previnfoIsVisible => !previnfoIsVisible)
                }
            >
                <span role="tooltip">{infoIsVisible ? "x" : "i"}</span>
            </button>

            {infoIsVisible && (
                <div
                    className="uiButton infoModal"
                    aria-describedBy="infoButton"
                    hidden={!infoIsVisible}
                >
                    <p>
                        a study of signed distanced functions in webgl, by{" "}
                        <a
                            href="https://neef.co"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            neef rehman
                        </a>
                        .
                    </p>
                    <p>
                        open source on{" "}
                        <a
                            href="https://github.com/neefrehman/manyworlds"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            github
                        </a>
                        .
                    </p>
                </div>
            )}
        </div>
    );
};

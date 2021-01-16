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
                        A study of signed distanced functions in glsl by{" "}
                        <a
                            href="https://neef.co"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Neef Rehman
                        </a>
                        . Open source on{" "}
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                        .
                    </p>
                </div>
            )}
        </div>
    );
};

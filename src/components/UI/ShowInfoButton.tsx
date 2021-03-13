import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

export const ShowInfoButton = () => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [infoIsVisible, setInfoIsVisible] = useState(false);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setInfoIsVisible(false);
        };

        const handleClickOutside = (event: any) => {
            if (
                buttonRef.current &&
                modalRef.current &&
                !modalRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setInfoIsVisible(false);
            }
        };

        if (infoIsVisible) {
            document.addEventListener("keydown", handleEscape);
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [modalRef, infoIsVisible]);

    return (
        <div>
            {infoIsVisible && (
                <div
                    ref={modalRef}
                    className="uiButton modal infoModal"
                    aria-describedBy="infoButton"
                    hidden={!infoIsVisible}
                >
                    <p>
                        a scifi-inspired study of signed distanced functions and
                        noise fields in webgl, by{" "}
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
            
            <button
                ref={buttonRef}
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
        </div>
    );
};

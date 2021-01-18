import { h } from "preact";
import { useState } from "preact/hooks";
import type { StateUpdater } from "preact/hooks";

interface LowFrameRateWarningProps {
    setIsLowFrameRate: StateUpdater<boolean>;
}

export const LowFrameRateWarning = ({
    setIsLowFrameRate,
}: LowFrameRateWarningProps) => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPixelation = urlParams.get("pixelation") ?? "1";
    const isAlreadyPixelated = currentPixelation !== "1";

    return (
        <div className="uiButton modal lowFrameRateModal">
            <p>
                It looks like the page is {isAlreadyPixelated ? "still" : null}{" "}
                running slowly. Try refreshing the site in a smaller window, or run
                a {isAlreadyPixelated ? "more pixelated" : "pixelated"} version of
                the animation.
            </p>
            <div className="buttonContainer">
                <button className="uiButton">
                    <a
                        href={`/?pixelation=${
                            parseFloat(currentPixelation) + 0.25
                        }`}
                    >
                        pixelate
                        {isAlreadyPixelated ? " again" : null}
                    </a>
                </button>
                <button
                    className="uiButton"
                    onClick={() => setIsLowFrameRate(false)}
                >
                    OK
                </button>
            </div>
        </div>
    );
};
import { h } from "preact";
import type { StateUpdater } from "preact/hooks";
import { seed } from "../../utils/random";

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
    <div className="uiButton modal centerModal">
      <p>
        it looks like this page is {isAlreadyPixelated ? "still " : null}
        running {isAlreadyPixelated ? "a bit " : null} slowly. for a smoother
        framerate, try refreshing the site in a smaller window, or run a slightly{" "}
        {isAlreadyPixelated ? "more" : null} pixelated version of the the animation.
      </p>
      <div className="buttonContainer">
        <button className="uiButton">
          <a
            href={`/?pixelation=${
              parseFloat(currentPixelation) + 0.25
            }&world=${seed}`}
          >
            pixelate
            {isAlreadyPixelated ? " again" : null}
          </a>
        </button>
        <button className="uiButton" onClick={() => setIsLowFrameRate(false)}>
          dismiss
        </button>
      </div>
    </div>
  );
};

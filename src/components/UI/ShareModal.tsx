import { h } from "preact";
import { StateUpdater, useState } from "preact/hooks";
import { seed } from "../../utils/random";

interface LowFrameRateWarningProps {
    setShowShareModal: StateUpdater<boolean>;
}

export const ShareModal = ({ setShowShareModal }: LowFrameRateWarningProps) => {
    const [copyButtonText, setCopyButtonText] = useState("copy");

    const url = `${window.location.host}/?world=${seed}`;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(url);
        setCopyButtonText("copied");
        setTimeout(() => setCopyButtonText("copy"), 2000);
    };

    return (
        <div className="uiButton modal centerModal">
            <p>this world can be revisited with the below link</p>
            <p className="shareUrl" onClick={handleCopy}>
                {url}
            </p>
            <div className="buttonContainer">
                <button className="uiButton" onClick={handleCopy}>
                    {copyButtonText}
                </button>
                <button
                    className="uiButton"
                    onClick={() => setShowShareModal(false)}
                >
                    dismiss
                </button>
            </div>
        </div>
    );
};

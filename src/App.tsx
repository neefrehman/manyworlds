import { h } from "preact";
import { useState } from "preact/hooks";

import {
    UIWrapper,
    ShowInfoButton,
    RefreshButton,
    LowFrameRateWarning,
} from "./components/UI";

import { Scene } from "./Scene";
import "./styles.css";

const App = () => {
    const [uiIsShown] = useState(!window.location.search.includes("no-ui"));
    const [infoIsVisible, setInfoIsVisible] = useState(false);
    const [isLowFrameRate, setIsLowFrameRate] = useState(false);
    const [refreshState, forceRefresh] = useState({});

    return (
        <main>
            {uiIsShown && (
                <UIWrapper>
                    <RefreshButton onClick={() => forceRefresh({})} />
                    <ShowInfoButton
                        infoIsVisible={infoIsVisible}
                        setInfoIsVisible={setInfoIsVisible}
                    />
                    {isLowFrameRate && (
                        <LowFrameRateWarning
                            setIsLowFrameRate={setIsLowFrameRate}
                        />
                    )}
                </UIWrapper>
            )}

            <div onClick={() => setInfoIsVisible(false)}>
                <Scene
                    refreshState={refreshState}
                    setIsLowFrameRate={setIsLowFrameRate}
                />
            </div>
        </main>
    );
};

export default App;

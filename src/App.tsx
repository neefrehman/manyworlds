import { h } from "preact";
import { useState } from "preact/hooks";

import { SceneWrapper, Scene } from "./components/WebGL";
import {
    UIWrapper,
    ShowInfoButton,
    RefreshButton,
    LowFrameRateWarning,
} from "./components/UI";
import "./components/WebGL/styles.css";
import "./components/UI/styles.css";

const App = () => {
    const [uiIsShown] = useState(!window.location.search.includes("no-ui"));
    const [infoIsVisible, setInfoIsVisible] = useState(false);
    const [isLowFrameRate, setIsLowFrameRate] = useState(false);
    const [refreshState, forceRefresh] = useState({});

    return (
        <main>
            {uiIsShown && (
                <UIWrapper>
                    <RefreshButton
                        onClick={() => forceRefresh({})}
                    />
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

            <SceneWrapper onClick={() => setInfoIsVisible(false)}>
                <Scene
                    refreshState={refreshState}
                    setIsLowFrameRate={setIsLowFrameRate}
                />
            </SceneWrapper>
        </main>
    );
};

export default App;

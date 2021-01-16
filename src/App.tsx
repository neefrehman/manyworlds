import { h } from "preact";
import { useState } from "preact/hooks";

import { SceneWrapper, Scene } from "./components/WebGL";
import { UIWrapper, ShowInfoButton, RefreshButton } from "./components/UI";
import "./components/WebGL/styles.css";
import "./components/UI/styles.css";

const App = () => {
    const [uiIsShown] = useState(!window.location.search.includes("no-ui"));
    const [_, forceRefresh] = useState({}); // TODO: refresh logic
    const [infoIsVisible, setInfoIsVisible] = useState(false);

    return (
        <main>
            {uiIsShown && (
                <UIWrapper>
                    <ShowInfoButton
                        infoIsVisible={infoIsVisible}
                        setInfoIsVisible={setInfoIsVisible}
                    />
                    <RefreshButton onClick={() => forceRefresh({})} />
                </UIWrapper>
            )}

            <SceneWrapper onClick={() => setInfoIsVisible(false)}>
                <Scene />
            </SceneWrapper>
        </main>
    );
};

export default App;

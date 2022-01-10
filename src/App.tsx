import { h, Fragment } from "preact";
import { useState } from "preact/hooks";

import {
  ShowInfoButton,
  RefreshButton,
  ShareButton,
  LowFrameRateWarning,
  ShareModal,
} from "./components/UI";
import { updateSeed } from "./utils/random";

import { Scene } from "./Scene";
import "./styles.css";

const App = () => {
  const [uiIsShown] = useState(!window.location.search.includes("no-ui"));
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLowFrameRate, setIsLowFrameRate] = useState(false);
  const [refreshState, forceRefresh] = useState({});

  const handleRefresh = () => {
    forceRefresh({});
    updateSeed();
  };

  return (
    <main>
      <Scene refreshState={refreshState} setIsLowFrameRate={setIsLowFrameRate} />

      {uiIsShown && (
        <Fragment>
          <div className="uiWrapper">
            <div>
              <ShareButton onClick={() => setShowShareModal(prev => !prev)} />
              <RefreshButton onClick={handleRefresh} />
            </div>
            <ShowInfoButton />
          </div>
          <div className="modalWrapper">
            {showShareModal && <ShareModal setShowShareModal={setShowShareModal} />}
            {isLowFrameRate && (
              <LowFrameRateWarning setIsLowFrameRate={setIsLowFrameRate} />
            )}
          </div>
        </Fragment>
      )}
    </main>
  );
};

export default App;

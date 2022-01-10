import { useEffect } from "preact/hooks";

/** A wrapper around `setTimeout` that handles invocation and cleanup */
export const useTimeout = (
  callback: (...args: never[]) => void,
  timeout: number
) => {
  useEffect(() => {
    const timeoutFunction: ReturnType<typeof setTimeout> = setTimeout(
      () => callback(),
      timeout
    );

    return () => clearTimeout(timeoutFunction);
  }, [callback, timeout]);
};

/** A wrapper around `setInterval` that handles invocation and cleanup */
export const useInterval = (
  callback: (...args: never[]) => void,
  timeout: number
) => {
  useEffect(() => {
    const timeoutFunction: ReturnType<typeof setInterval> = setInterval(
      () => callback(),
      timeout
    );

    return () => clearInterval(timeoutFunction);
  }, [callback, timeout]);
};

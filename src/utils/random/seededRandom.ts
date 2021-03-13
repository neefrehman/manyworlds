import seedrandom from "seedrandom";

const SEED_LENGTH = 12;

const toHexadecimal = (number: number) => number.toString(16);

const createSeed = () => {
    const intArray = new Uint8Array(SEED_LENGTH);
    crypto.getRandomValues(intArray);
    return Array.from(intArray, toHexadecimal).join("");
};

const url = new URL(window.location.href);
const urlParams = url.searchParams;

export let seed = urlParams.get("world") ?? createSeed();
export let seededRandom = seedrandom(seed);

const removeSeedFromParams = () => {
    urlParams.delete("world");
    history.replaceState(null, document.title, url.toString());
};

export const updateSeed = () => {
    removeSeedFromParams();
    seed = createSeed();
    seededRandom = seedrandom(seed);
};
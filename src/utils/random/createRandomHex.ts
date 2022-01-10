import { seededRandom } from "./seededRandom";

/**
 * Tests that a hex code is valid
 * @param hex a hex code
 */
export const testHex = (hex: string): boolean =>
  /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex);

/**
 * Produces a random hex code
 */
export const createRandomHex = (): string => {
  let hex = `#${Math.floor(seededRandom() * 16777215).toString(16)}`;
  hex = hex.length === 7 ? hex : `${hex}0`;

  return /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex) ? hex : createRandomHex();
};

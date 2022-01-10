import type { Vector } from "../math";
import { seededRandom } from "./seededRandom";

/**
 * Chooses a random 2D point within a square.
 *
 * @param width - The width of the square
 * @param height - The height of the square
 * @returns A vector point within the square
 */
export const inSquare = (width = 1, height = 1): Vector<2> => [
  seededRandom() * width,
  seededRandom() * height,
];

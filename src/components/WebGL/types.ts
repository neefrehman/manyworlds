import type { Vector } from "../../utils/math/types";

// WebGL helper types

// Uniform types currently supported by the renderer
export type UniformDimensions = "1" | "2" | "3" | "4";
export type UniformValueType = "f" | "i" | "fv" | "iv";
export type UniformType = `${UniformDimensions}${UniformValueType}`;

export type UniformValue = number | Vector | Float32List | Int32List;

/**
 * A uniform value to interface with shaders
 */
export interface Uniform<T extends UniformType> {
  value: any;
  type: T;
}

/**
 * A dictionary of uniforms
 */
export interface UniformDict {
  [uniformName: string]: Uniform<UniformType>;
}

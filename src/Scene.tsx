import { h } from "preact";
import { useCallback } from "preact/hooks";
import type { StateUpdater } from "preact/hooks";
import { memo } from "preact/compat";
import glsl from "glslify";

import type { WebGLSetupFn } from "./components/WebGL";
import { WebGLRenderer } from "./components/WebGL";

import { hexToVec3 } from "./utils/glsl/hexToVec3";
import { clamp, lerp, lerpVector } from "./utils/math";
import {
  createChance,
  createRandomHex,
  createSign,
  inBeta,
  inGaussian,
  inRange,
  inSquare,
  pick,
} from "./utils/random";

const urlParams = new URLSearchParams(window.location.search);
let pixelation = parseFloat(urlParams.get("pixelation") ?? "1");
if (pixelation < 1) pixelation = 1;

// `createSketch` returns the actual sketch function to be passed to the renderer.
// this is so that I can pass in the setIsLowFrameRate updater from the `Scene`
// component, and update preact state inside the sketch's `onFrame` callback.
const createSketch = (setIsLowFrameRate: StateUpdater<boolean>) => {
  let lowFrameRateAlertHasBeenShown = false;

  const sketch: WebGLSetupFn = ({ width, height, aspect }) => {
    const actualWidth = width * pixelation;
    const actualHeight = height * pixelation;

    const initialPlaybackSpeed = clamp(-1.8, inGaussian(0.4, 1), 1.8) * 0.0001;
    let playbackSpeed = initialPlaybackSpeed;

    const idleMousePosition = inSquare(actualWidth, actualHeight);
    const mouseLerpSpeed = inGaussian(0.81, 0.12) * 0.001;

    // uniforms can't be used for a loop index comparison in glsl: https://www.khronos.org/webgl/public-mailing-list/public_webgl/1012/msg00063.php
    // instead, i'm using js to replace "$DRAW_DISTANCE" in the shader
    // with the below variable, at the end of the `frag` glsl string.
    const drawDistanceInt = Math.max(Math.round(inBeta(1.11, 1) * 256), 14);

    return {
      uniforms: {
        aspect: { value: aspect, type: "1f" },
        time: { value: inRange(0, 999), type: "1f" },
        resolution: { value: [actualWidth, actualHeight], type: "2f" },
        mousePosition: {
          value: [actualWidth / 2, actualHeight / 2],
          type: "2f",
        },

        bgBrightness: { value: inBeta(1, 4.5) * 0.072, type: "1f" },
        colorBrightness: { value: inRange(0.63, 0.77), type: "1f" },
        color1: { value: hexToVec3(createRandomHex()), type: "3f" },
        color2: { value: hexToVec3(createRandomHex()), type: "3f" },

        noiseStyle: {
          value: pick([0, 0, 1, 2, 3, 4, 5, 6, 7]),
          type: "1i",
        },
        noiseStrength: {
          value: createChance(0.05) ? 0 : inBeta(2, 1),
          type: "1f",
        },
        sinNoiseScale: { value: inRange(5, 12), type: "1f" },
        sinScalar1: { value: inRange(0, 30), type: "1f" },
        sinScalar2: { value: inRange(0, 5), type: "1f" },
        scalarSwap: { value: createSign(0.6), type: "1i" },
        simplexNoiseScale: { value: inRange(0.57, 0.67), type: "1f" },
        stretchedSimplexNoiseScale: {
          value: [inRange(0.4, 0.6), inRange(0.4, 0.6), inRange(0.4, 0.6)],
          type: "3f",
        },
        highFrequencySimplexNoiseScale: {
          value: 1.5 + inBeta(1, 3) * 48.5,
          type: "1f",
        },
        simplexIntensity: { value: inRange(0.5, 4.3), type: "1f" },
        noiseRotationSpeed: {
          value: inRange(0.6, 1) * createSign(),
          type: "1f",
        },
        grainIntensity: { value: inRange(0.005, 0.026), type: "1f" },

        baseShape: {
          value: inRange(0, 9, { isInteger: true }),
          type: "1i",
        },
        shouldRenderShape2: {
          value: createChance(0.366) ? 1 : 0,
          type: "1i",
        },
        shapeDimension1: { value: inRange(0.4, 0.52), type: "1f" },
        shapeDimension2: { value: inRange(0.2, 0.35), type: "1f" },
        shapeDimension3: { value: inRange(0.32, 0.4), type: "1f" },
        shapePositionOffset: {
          value: [
            inGaussian(0, 0.3),
            inGaussian(0, 0.3),
            clamp(-0.95, inGaussian(0, 0.55), 0.33),
          ],
          type: "3f",
        },
        shape2PositionOffset: {
          value: [
            inGaussian(0, 0.6),
            inGaussian(0, 0.4),
            clamp(-0.95, inGaussian(0, 0.8), 0.5),
          ],
          type: "3f",
        },
        shapeRotationVector: {
          value: [
            inBeta(11, 1) * createSign(),
            inBeta(11, 1) * createSign(),
            inBeta(11, 1) * createSign(),
          ],
          type: "3f",
        },
        shape2RotationVector: {
          value: [
            inBeta(11, 1) * createSign(),
            inBeta(11, 1) * createSign(),
            inBeta(11, 1) * createSign(),
          ],
          type: "3f",
        },
        shapeRotationSpeed: {
          value: inGaussian(0.8, 0.01) * createSign(),
          type: "1f",
        },
      },
      frag: glsl`
        precision highp float;

        #pragma glslify: noise = require("glsl-noise/simplex/4d");
        #pragma glslify: rotate = require("./utils/glsl/rotate.glsl");
        #pragma glslify: filmGrain = require("./utils/glsl/grain.glsl");

        #pragma glslify: sdEllipsoid = require("./utils/glsl/sdShapes/sdEllipsoid.glsl");
        #pragma glslify: sdSphere = require("./utils/glsl/sdShapes/sdSphere.glsl");
        #pragma glslify: sdCuboid = require("./utils/glsl/sdShapes/sdCuboid.glsl");
        #pragma glslify: sdOctahedron = require("./utils/glsl/sdShapes/sdOctahedron.glsl");
        #pragma glslify: sdTorus = require("./utils/glsl/sdShapes/sdTorus.glsl");
        #pragma glslify: sdCone = require("./utils/glsl/sdShapes/sdCone.glsl");
        #pragma glslify: sdCappedCone = require("./utils/glsl/sdShapes/sdCappedCone.glsl");
        #pragma glslify: sdPyramid = require("./utils/glsl/sdShapes/sdPyramid.glsl");
        #pragma glslify: sdRhombus = require("./utils/glsl/sdShapes/sdRhombus.glsl");

        #define PI 3.14159
        #define TAU 2.0 * PI

        varying vec2 vUv;

        uniform float time;
        uniform float aspect;
        uniform vec2 resolution;
        uniform vec2 mousePosition;

        uniform float bgBrightness;
        uniform float colorBrightness;
        uniform vec3 color1;
        uniform vec3 color2;

        uniform int noiseStyle;
        uniform float noiseStrength;
        uniform float sinNoiseScale;
        uniform float sinScalar1;
        uniform float sinScalar2;
        uniform int scalarSwap;
        uniform float simplexNoiseScale;
        uniform vec3 stretchedSimplexNoiseScale;
        uniform float highFrequencySimplexNoiseScale;
        uniform float simplexIntensity;
        uniform float noiseRotationSpeed;
        uniform float grainIntensity;

        uniform int baseShape;
        uniform int shouldRenderShape2;
        uniform float shapeDimension1;
        uniform float shapeDimension2;
        uniform float shapeDimension3;
        uniform vec3 shapePositionOffset;
        uniform vec3 shape2PositionOffset;
        uniform vec3 shapeRotationVector;
        uniform vec3 shape2RotationVector;
        uniform float shapeRotationSpeed;

        float getNoise(vec3 pos) {
          if (noiseStyle == 0) {
            // additive - sin & simplex — 150121
            return
              sin(pos.x) + sin(pos.y) + sin(pos.z) / (sinNoiseScale / (sinNoiseScale * 9.0)) +
              noise(vec4(pos * simplexNoiseScale, time * 8.8)) * simplexIntensity;
          } else if (noiseStyle == 1) {
            // comparative - sin & simplex — 150121
            return max(
              sin(pos.x * 1.96) + sin(pos.y * 1.96) + (sin(pos.z * 1.96) * sinNoiseScale),
              ( sin(pos.x * 2.0) + sin(pos.y * 2.0) + (sin(pos.z * 2.0) * sinNoiseScale) +
                noise(vec4(pos * simplexNoiseScale, time * 7.6)) * simplexIntensity )
            );
          } else if (noiseStyle == 2) {
            // comparative - high sin field differential — 170121
            float scalar1 = scalarSwap == 1 ? sinScalar1 : sinScalar2;
            float scalar2 = scalarSwap == 1 ? sinScalar2 : sinScalar1;
            return max(
              sin(pos.x * scalar1) + sin(pos.y * scalar1) + (sin(pos.z * scalar1) * sinNoiseScale),
              ( sin(pos.x * scalar2) + sin(pos.y * scalar2) + (sin(pos.z * scalar2) * sinNoiseScale) +
                noise(vec4(pos * simplexNoiseScale, time * 7.0)) * simplexIntensity )
            );
          } else if (noiseStyle == 3) {
            // inverted comparison - high sin field differential — 170121
            float scalar1 = scalarSwap == 1 ? sinScalar1 : sinScalar2;
            float scalar2 = scalarSwap == 1 ? sinScalar2 : sinScalar1;
            return min(
              sin(pos.x * scalar1) + sin(pos.y * scalar1) + (sin(pos.z * scalar1) * sinNoiseScale),
              ( sin(pos.x * scalar2) + sin(pos.y * scalar2) + (sin(pos.z * scalar2) * sinNoiseScale) +
                noise(vec4(pos * simplexNoiseScale, time * 8.0)) * simplexIntensity )
            );
          } else if (noiseStyle == 4) {
            // comparative - high simplex field frequency — 160121
            return max(
              sin(pos.x * 2.0) + sin(pos.y * 2.0) + (sin(pos.z * 2.0) * sinNoiseScale),
              ( sin(pos.x * 2.0) + sin(pos.y * 2.0) + (sin(pos.z * 2.0) * sinNoiseScale) +
                noise(vec4(pos * highFrequencySimplexNoiseScale, time * 8.7)) * simplexIntensity * 2.0 )
            );
          } else if (noiseStyle == 5) {
            // additive - high simplex field frequency — 160121
            return
              sin(pos.x) + sin(pos.y) + sin(pos.z) / (sinNoiseScale / (sinNoiseScale * 7.0)) +
              noise(vec4(pos * highFrequencySimplexNoiseScale, time * 21.0)) * simplexIntensity;
          } else if (noiseStyle == 6) {
            // inverted volume with simplex field — 150121
            return min(
              sin(pos.x) + sin(pos.y) + sin(pos.z) * 9.0,
              noise(vec4(pos * simplexNoiseScale * 0.94, time * 8.4)) * simplexIntensity
            );
          } else if (noiseStyle == 7) {
            // inverted volume with stretched simplex field — 180121
            return min(
              sin(pos.x) + sin(pos.y) + sin(pos.z) * 9.0,
              noise(vec4(
                pos.x * stretchedSimplexNoiseScale.x,
                pos.y * stretchedSimplexNoiseScale.y,
                pos.x * stretchedSimplexNoiseScale.z,
                time * 7.4
              )) * simplexIntensity
            );
          }
        }

        float sdf(vec3 pos) {
          vec3 shapePosition = rotate(
            vec3(pos + shapePositionOffset),
            shapeRotationVector,
            time * shapeRotationSpeed * TAU
          );
          vec3 shape2Position = rotate(
            vec3(pos + shape2PositionOffset),
            shape2RotationVector,
            time * shapeRotationSpeed * TAU
          );

          float shape = 0.0;
          float shape2 = 0.0;

          if (baseShape == 0) {
            shape = sdSphere(shapePosition, shapeDimension1);
            shape2 = sdSphere(shape2Position, shapeDimension1);
          } else if (baseShape == 1) {
            shape = sdEllipsoid(shapePosition, vec3(shapeDimension1, shapeDimension2, shapeDimension3));
            shape2 = sdEllipsoid(shapePosition, vec3(shapeDimension1, shapeDimension2, shapeDimension3));
          } else if (baseShape == 2) {
            shape = sdOctahedron(shapePosition, shapeDimension1);
            shape2 = sdOctahedron(shapePosition, shapeDimension1);
          } else if (baseShape == 3) {
            shape = sdTorus(shapePosition, vec2(shapeDimension1, shapeDimension2));
            shape2 = sdTorus(shape2Position, vec2(shapeDimension1, shapeDimension2));
          } else if (baseShape == 4) {
            shape = sdCappedCone(shapePosition, shapeDimension1, shapeDimension3, shapeDimension2);
            shape2 = sdCappedCone(shape2Position, shapeDimension1, shapeDimension3, shapeDimension2);
          } else if (baseShape == 5) {
            shape = sdPyramid(shapePosition, shapeDimension1);
            shape2 = sdPyramid(shape2Position, shapeDimension1);
          } else if (baseShape == 6) {
            shapePosition -= vec3(0.2, 0.2, 0.0);
            shape = sdCone(shapePosition, vec2(shapeDimension3, shapeDimension2), shapeDimension1);
            shape2 = sdCone(shape2Position, vec2(shapeDimension3, shapeDimension2), shapeDimension1);
          } else if (baseShape == 7) {
            shape = sdCuboid(shapePosition, vec3(shapeDimension1 * 0.88));
            shape2 = sdCuboid(shape2Position, vec3(shapeDimension1 * 0.88));
          } else if (baseShape == 8) {
            shape = sdRhombus(shapePosition, 0.2, 0.2, 0.2, 0.3);
            shape2 = sdRhombus(shape2Position, 0.2, 0.2, 0.2, 0.3);
          } else if (baseShape == 9) {
            vec3 rhombus1Pos = vec3(shapePosition.x - 0.3, shapePosition.y, shapePosition.z + 0.06);
            vec3 rhombus2Pos = vec3(shapePosition.x + 0.0, shapePosition.y, shapePosition.z + 0.00);
            vec3 rhombus2RotatedPos = rotate(rhombus2Pos, vec3(0.0, -0.005, 0.0), 2.65);
            float rhombus1 = sdRhombus(rhombus1Pos, 0.1, 0.4, shapeDimension1 * 0.1, 0.02);
            float rhombus2 = sdRhombus(rhombus2RotatedPos, 0.1, 0.4, shapeDimension1 * 0.1, 0.02);
            shape = min(rhombus1, rhombus2);
            vec3 shape2Pos = vec3(shape2Position.x - 0.3, shape2Position.y, shape2Position.z + 0.06);
            shape2 = sdRhombus(shape2Pos, 0.2, 0.5, 0.1, 0.02);
          }

          shape = shouldRenderShape2 == 1 ? min(shape, shape2) : shape;
            
          vec3 noisePosition = rotate(pos, vec3(mousePosition / resolution, 1.0), -time * noiseRotationSpeed);

          float noiseField = 
            ((0.83 - getNoise((noisePosition + vec3(0.0, 0.2, 0.0)) * sinNoiseScale)) / sinNoiseScale)
            * noiseStrength;

          return max(shape, noiseField);
        }

        vec3 getColor(vec3 pos) {
          float amount = clamp((1.5 - length(pos)) / 2.3, 0.0, 1.0);
          vec3 color = colorBrightness + 0.708 * cos(TAU * (color1 + amount * color2));

          return color * amount;
        }

        void main()	{
          vec2 uv = vUv * vec2(aspect, 1.0) + vec2((1.0 - aspect) / 2.0, 0.0);
        
          vec3 camPos = vec3(0.0, 0.0, 2.0);
          vec2 pos = uv - vec2(0.5);
          vec3 ray = normalize(vec3(pos, -1.0));

          vec3 currentRayPos = camPos;
          float curDist = 0.0;
          float rayLength = 0.0;

          vec3 finalColor = vec3(bgBrightness);

          for (int i = 0; i <= $DRAW_DISTANCE; i++) {
            curDist = sdf(currentRayPos);
            rayLength +=  0.536 * curDist;
            currentRayPos = camPos + ray * rayLength;
                
            if (curDist < 0.0001 || curDist > 2.2) {
              break;
            }

            finalColor += (0.087 * getColor(currentRayPos));
          }

          vec3 color = finalColor;

          if (curDist > 0.1) {
            color = max(finalColor, 0.0);
          }

          float grainAmount = filmGrain(vUv * time) * grainIntensity;
          gl_FragColor = vec4(color - grainAmount, 1.0);
        }
      `.replace("$DRAW_DISTANCE", drawDistanceInt.toString()),
      onFrame: ({ uniforms, mousePosition, mouseHasEntered, fps }) => {
        if (fps < 14 && !lowFrameRateAlertHasBeenShown) {
          setIsLowFrameRate(true);
          lowFrameRateAlertHasBeenShown = true;
        }

        if (fps < 45) {
          playbackSpeed = lerp(
            playbackSpeed,
            initialPlaybackSpeed * Math.min(60 / fps, 5),
            0.05
          );
        }

        uniforms.time.value += playbackSpeed;

        uniforms.mousePosition.value = lerpVector(
          uniforms.mousePosition.value,
          mouseHasEntered ? mousePosition : idleMousePosition,
          mouseLerpSpeed
        );
      },
    };
  };

  return sketch;
};

interface SceneProps {
  refreshState: {};
  setIsLowFrameRate: StateUpdater<boolean>;
}

export const Scene = memo(
  ({ setIsLowFrameRate }: SceneProps) => {
    const sketch = useCallback(createSketch(setIsLowFrameRate), [setIsLowFrameRate]);

    return (
      <WebGLRenderer
        sketch={sketch}
        settings={{
          dimensions: [
            window.innerWidth / pixelation,
            window.innerHeight / pixelation,
          ],
        }}
      />
    );
  },
  (previousRender, nextRender) => {
    if (previousRender.refreshState === nextRender.refreshState) {
      return true;
    }
    return false;
  }
);

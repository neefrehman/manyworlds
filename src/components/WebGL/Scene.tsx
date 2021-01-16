import { h } from "preact";
import { memo } from "preact/compat";
import glsl from "glslify";

import type { WebGLSetupFn } from "./Renderer";
import { WebGLRenderer } from "./Renderer";

import { hexToVec3 } from "../../utils/glsl/hexToVec3";
import { lerp, lerpVector } from "../../utils/math";
import {
    createHex,
    createSign,
    inBeta,
    inGaussian,
    inRange,
    inSquare,
    pick,
} from "../../utils/random";

const sketch: WebGLSetupFn = ({ width, height, aspect }) => {
    const idleMousePosition = inSquare(width, height);

    const initialPlaybackSpeed = inRange(0.000065, 0.00008);
    let playbackSpeed = initialPlaybackSpeed;    

    return {
        uniforms: {
            aspect: { value: aspect, type: "1f" },
            time: { value: inRange(0, 500), type: "1f" },
            resolution: { value: [width, height], type: "2f" },
            mousePosition: { value: [0, height], type: "2f" },

            bgBrightness: { value: inBeta(1, 3) * 0.06, type: "1f" },
            colorStart: { value: hexToVec3(createHex()), type: "3f" },
            colorEnd: { value: hexToVec3(createHex()), type: "3f" },

            noiseStyle: { value: pick([0, 1, 2, 3, 4, 5]), type: "1i" },
            noiseRotationSpeed: {
                value: inRange(0.66, 0.9) * createSign(),
                type: "1f",
            },
            sinNoiseScale: { value: inRange(5, 12), type: "1f" },
            sinScalar1: { value: inRange(0, 30), type: "1f" },
            sinScalar2: { value: inRange(0, 5), type: "1f" },
            scalarSwap: { value: createSign(0.6), type: "1i" },
            simplexNoiseScale: { value: inRange(0.58, 0.67), type: "1f" },
            stretchedSimplexNoiseScale: {
                value: [inRange(0.4, 0.6), inRange(0.4, 0.6), inRange(0.4, 0.6)],
                type: "3f",
            },
            highFrequencysimplexNoiseScale: {
                value: 1.5 + inBeta(1, 3) * 48.5,
                type: "1f",
            },
            simplexIntensity: { value: inRange(0.5, 4.3), type: "1f" },
            grainIntensity: { value: inRange(0.005, 0.034), type: "1f" },

            baseShape: {
                value: inRange(0, 7, { isInteger: true }),
                type: "1i",
            },
            shapeDimension1: { value: inRange(0.4, 0.52), type: "1f" },
            shapeDimension2: { value: inRange(0.2, 0.35), type: "1f" },
            shapeDimension3: { value: inRange(0.32, 0.4), type: "1f" },
            shapePositionOffset: {
                value: [
                    inGaussian(0, 0.115) * aspect,
                    inGaussian(0, 0.115),
                    (inBeta(1.8, 5) - 0.1) * 0.63,
                ],
                type: "3f",
            },
        },
        frag: glsl`
            precision highp float;

            #pragma glslify: noise = require("glsl-noise/simplex/4d");
            #pragma glslify: rotate = require("../../utils/glsl/rotate.glsl");
            #pragma glslify: filmGrain = require("../../utils/glsl/grain.glsl");

            #pragma glslify: sdEllipsoid = require("../../utils/glsl/sdShapes/sdEllipsoid.glsl");
            #pragma glslify: sdSphere = require("../../utils/glsl/sdShapes/sdSphere.glsl");
            #pragma glslify: sdCuboid = require("../../utils/glsl/sdShapes/sdCuboid.glsl");
            #pragma glslify: sdOctahedron = require("../../utils/glsl/sdShapes/sdOctahedron.glsl");
            #pragma glslify: sdTorus = require("../../utils/glsl/sdShapes/sdTorus.glsl");
            #pragma glslify: sdCone = require("../../utils/glsl/sdShapes/sdCone.glsl");
            #pragma glslify: sdCappedCone = require("../../utils/glsl/sdShapes/sdCappedCone.glsl");
            #pragma glslify: sdPyramid = require("../../utils/glsl/sdShapes/sdPyramid.glsl");

            #define PI 3.14159
            #define TAU 2.0 * PI

            varying vec2 vUv;

            uniform float time;
            uniform float aspect;
            uniform vec2 resolution;
            uniform vec2 mousePosition;

            uniform float bgBrightness;
            uniform vec3 colorStart;
            uniform vec3 colorEnd;

            uniform int noiseStyle;
            uniform float noiseRotationSpeed;
            uniform float sinNoiseScale;
            uniform float sinScalar1;
            uniform float sinScalar2;
            uniform int scalarSwap;
            uniform float simplexNoiseScale;
            uniform vec3 stretchedSimplexNoiseScale;
            uniform float highFrequencysimplexNoiseScale;
            uniform float simplexIntensity;
            uniform float grainIntensity;

            uniform int baseShape;
            uniform float shapeDimension1;
            uniform float shapeDimension2;
            uniform float shapeDimension3;
            uniform vec3 shapePositionOffset;

            float sineNoise(vec3 pos) {
                if (noiseStyle == 0) {
                    // inverted volume with simplex field — 150121
                    return min(
                        sin(pos.x) + sin(pos.y) + sin(pos.z) * 9.0,
                        noise(vec4(pos * simplexNoiseScale * 0.94, time * 6.7)) * simplexIntensity
                    );
                } else if (noiseStyle == 1) {
                    // sin & simplex, cumulative — 150121
                    return
                        sin(pos.x) + sin(pos.y) + sin(pos.z) / (sinNoiseScale / (sinNoiseScale * 9.0)) +
                        noise(vec4(pos * simplexNoiseScale, time * 13.0)) * simplexIntensity;
                } else if (noiseStyle == 2) {
                    // sin & simplex, max value — 150121
                    return max(
                        sin(pos.x * 1.96) + sin(pos.y * 1.96) + (sin(pos.z * 1.96) * sinNoiseScale),
                        sin(pos.x * 2.0) + sin(pos.y * 2.0) + (sin(pos.z * 2.0) * sinNoiseScale) + (noise(vec4(pos * simplexNoiseScale, time * 10.0)) * simplexIntensity)
                    );
                } else if (noiseStyle == 3) {
                    // high sin field differential — 170121
                    float scalar1 = scalarSwap == 1 ? sinScalar1 : sinScalar2;
                    float scalar2 = scalarSwap == 1 ? sinScalar2 : sinScalar1;
                    return max(
                        sin(pos.x * scalar1) + sin(pos.y * scalar1) + (sin(pos.z * scalar1) * sinNoiseScale),
                        sin(pos.x * scalar2) + sin(pos.y * scalar2) + (sin(pos.z * scalar2) * sinNoiseScale) + (noise(vec4(pos * simplexNoiseScale, time * 10.0)) * simplexIntensity)
                    );
                } else if (noiseStyle == 4) {
                    // high simplex field frequency — 160121
                    return max(
                        sin(pos.x * 2.0) + sin(pos.y * 2.0) + (sin(pos.z * 2.0) * sinNoiseScale),
                        sin(pos.x * 2.0) + sin(pos.y * 2.0) + (sin(pos.z * 2.0) * sinNoiseScale) + (noise(vec4(pos * highFrequencysimplexNoiseScale, time * 8.0)) * simplexIntensity * 2.0)
                    );
                } else {
                    // inverted volume with stretched simplex field — 180121
                    return min(
                        sin(pos.x) + sin(pos.y) + sin(pos.z) * 9.0,
                        noise(vec4(
                            pos.x * stretchedSimplexNoiseScale.x,
                            pos.y * stretchedSimplexNoiseScale.y,
                            pos.x * stretchedSimplexNoiseScale.z,
                            time * 8.0
                        )) * simplexIntensity
                    );
                }
            }

            float sdf(vec3 pos) {
                vec3 p1 = rotate(vec3(pos + shapePositionOffset), vec3(1.0, 1.0, 0.0), time * TAU);

                float shape = 0.0;

                if (baseShape == 0) {
                    shape = sdSphere(p1, shapeDimension1);
                } else if (baseShape == 1) {
                    shape = sdEllipsoid(p1, vec3(shapeDimension1, shapeDimension2, shapeDimension3));
                } else if (baseShape == 2) {
                    p1 = rotate(pos, vec3(0.0, 1.0, 0.1), time * TAU);
                    shape = sdOctahedron(p1, shapeDimension1);
                } else if (baseShape == 3) {
                    shape = sdTorus(p1, vec2(shapeDimension1, shapeDimension2));
                } else if (baseShape == 4) {
                    shape = sdCappedCone(p1, shapeDimension1, shapeDimension3, shapeDimension2);
                } else if (baseShape == 5) {
                    shape = sdPyramid(p1, shapeDimension1);
                } else if (baseShape == 6) {
                    p1 -= vec3(0.2, 0.2, 0.0);
                    shape = sdCone(p1, vec2(shapeDimension3, shapeDimension2), shapeDimension1);
                } else if (baseShape == 7) {
                    shape = sdCuboid(p1, vec3(shapeDimension1 * 0.88));
                }
                
                vec3 p2 = rotate(pos, vec3(mousePosition, 1.0), -time * TAU * noiseRotationSpeed);
                float sineNoiseValue = (0.83 - sineNoise((p2 + vec3(0.0, 0.2, 0.0)) * sinNoiseScale)) / sinNoiseScale;

                return max(shape, sineNoiseValue);
            }

            vec3 getColor(vec3 pos) {
                float amount = clamp((1.5 - length(pos)) / 2.3, 0.0, 1.0);
                vec3 color = 0.620 + 0.708 * cos(TAU * (colorStart + amount * colorEnd));

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

                for (int i = 0; i <= 256; i++) {
                    curDist = sdf(currentRayPos);
                    rayLength +=  0.536 * curDist;
                    currentRayPos = camPos + ray * rayLength;
                    
                    if (curDist < 0.001 || curDist > 2.2) {
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
        `,
        onFrame: ({ uniforms, mousePosition, mouseHasEntered, fps }) => {
            playbackSpeed = lerp(
                playbackSpeed,
                fps < 40
                    ? initialPlaybackSpeed * Math.min(60 / fps, 2)
                    : initialPlaybackSpeed,
                0.033
            );

            uniforms.time.value += playbackSpeed;

            uniforms.mousePosition.value = lerpVector(
                uniforms.mousePosition.value,
                mouseHasEntered ? mousePosition : idleMousePosition,
                0.001
            );
        },
    };
};

interface SceneProps {
    refreshState: {};
}

export const Scene = memo(
    ({ refreshState }: SceneProps) => {
        return (
            <WebGLRenderer
                sketch={sketch}
                settings={{ dimensions: [window.innerWidth, window.innerHeight] }}
                style={{ width: "100vw", height: "100vh" }}
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
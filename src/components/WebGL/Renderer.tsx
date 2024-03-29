import { h } from "preact";
import { useRef, useEffect } from "preact/hooks";
import glsl from "glslify";

import { useAnimationFrame } from "../../hooks/useAnimationFrame";
import type { OnFrameProps } from "../../hooks/useAnimationFrame";

import type { UniformDict, UniformType } from "./types";

import type { GLContext } from "./helpers";
import {
  compileShader,
  createAttribute,
  getUniformLocation,
  setUniform,
} from "./helpers";

/** Component props for the WebGLRenderer */
interface WebGLRendererProps {
  /** The sketch function to be run */
  sketch: WebGLSetupFn;
  /** The setting for the sketch */
  settings?: WebGLRendererSettings;
}

/**
 * A canvas component for running fragment shaders. Handles rendering and cleanup.
 */
export const WebGLRenderer = ({
  sketch: setupSketch,
  settings = {},
}: WebGLRendererProps) => {
  const canvasElement = useRef<HTMLCanvasElement>(null);
  const drawProps = useRef<WebGLDrawProps>({} as WebGLDrawProps);
  const drawFunction = useRef<WebGLDrawFn>();
  const uniformsRef = useRef<UniformDict>({});

  const {
    dimensions = [window.innerWidth, window.innerHeight],
    isAnimated = true,
    animationSettings = {},
  } = settings;

  // TODO: width and height are updated on rerenders, and the canvas has updated dimensions
  // but only the size that was visible on pageload will be 'painted' 🤔
  const [width, height] = dimensions;
  const { fps: throttledFps, delay, endAfter } = animationSettings;

  // Here we pass in our animation settings and created `onFrame` props to a `requestAnimationFrame` hook.
  const { startAnimation, stopAnimation } = useAnimationFrame(
    animationProps => {
      drawFunction.current?.({
        ...drawProps.current,
        uniforms: uniformsRef.current,
        frameCount: animationProps.frameCount,
        elapsedTime: animationProps.elapsedTime,
        fps: animationProps.fps,
        startAnimation,
        stopAnimation,
        isPlaying: animationProps.isPlaying,
        mouseHasEntered: animationProps.mouseHasEntered,
        mousePosition: animationProps.mousePosition,
        mouseIsDown: animationProps.mouseIsDown,
        mouseIsIdle: animationProps.mouseIsIdle,
      });
    },
    {
      willPlay: isAnimated,
      fps: throttledFps,
      delay,
      endAfter,
      domElementRef: canvasElement,
    }
  );

  // Default vertex shader used to pass our vUv co-ordinate varying to the fragment shader
  const defaultVert = glsl`
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Default Fragment shader — a white canvas
  const defaultFrag = glsl`
    void main() {
      gl_FragColor = vec4(1.0);
    }
  `;

  useEffect(() => {
    // Create WebGL context and program
    const canvas = canvasElement.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl") as WebGLRenderingContext;
    const program = gl.createProgram() as WebGLProgram;

    // initiallise our drawProps object
    const initialSketchProps: Partial<WebGLDrawProps> = {
      gl,
      program,
      uniforms: uniformsRef.current,
      width,
      height,
      aspect: width / height,
      mouseHasEntered: false,
      mousePosition: [0, 0],
    };

    // Which we then pass to the sketch function
    const sketchObject = setupSketch(initialSketchProps as WebGLDrawProps);

    const uniforms = sketchObject.uniforms as UniformDict;
    const vert = sketchObject.vert ?? defaultVert;
    const frag = sketchObject.frag ?? defaultFrag;
    const onFrame = sketchObject.onFrame;

    // compile and initialise our shaders
    const vertexShader = compileShader(vert, gl.VERTEX_SHADER, gl);
    const fragmentShader = compileShader(frag, gl.FRAGMENT_SHADER, gl);

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Create the uniforms we defined and store their details for later
    // so we can keep them up to date and handle cleanup
    const createdUniforms: {
      key: string;
      handle: WebGLUniformLocation;
      type: UniformType;
    }[] = Object.entries(uniforms).reduce((acc: any[], [key, { value, type }]) => {
      const handle = getUniformLocation(key, program, gl);
      setUniform(handle, value, type, gl);
      return [...acc, { key, handle, type }];
    }, []);

    // Create out position data and give it to the shaders as an attribute
    /* prettier-ignore */
    const vertexData = new Float32Array([
      -1.0,  1.0,
      -1.0, -1.0,
       1.0,  1.0,
       1.0, -1.0,
    ]);
    const positionAttr = createAttribute("position", vertexData, program, gl);

    // Create out uv data and give it to the shaders as an attribute
    /* prettier-ignore */
    const uvData = new Float32Array([
      0.0,  0.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
    ]);
    const uvAttr = createAttribute("uv", uvData, program, gl);

    // update our ref that stores the drawprops, which is used above in the animation hook
    drawProps.current = initialSketchProps as WebGLDrawProps;
    uniformsRef.current = uniforms;

    // update our ref that stores the drawFucntion, which will be called in each frame of the animation
    drawFunction.current = currentDrawProps => {
      onFrame?.(currentDrawProps);

      // update our uniforms
      createdUniforms.forEach(({ key, handle, type }) => {
        const newValue = uniformsRef.current[key].value;
        setUniform(handle, newValue, type, gl);
      });

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // Fix for intermittent lack of rendering on Safari & iOS
    /* prettier-ignore */
    setTimeout(() => {
            canvas.width += 1;
            canvas.width -= 1;
        }, 1);

    return () => {
      // cleanup our context
      gl.deleteBuffer(positionAttr.buffer);
      gl.disableVertexAttribArray(positionAttr.handle);
      gl.deleteBuffer(uvAttr.buffer);
      gl.disableVertexAttribArray(uvAttr.handle);
    };
  }, [setupSketch, settings, width, height, defaultVert, defaultFrag]);

  useEffect(
    // on component unmount, fully lose the gl context
    () => () => {
      const gl = drawProps.current.gl;
      gl.canvas.width = 1;
      gl.canvas.height = 1;

      const loseContext = gl.getExtension("WEBGL_lose_context");
      loseContext?.loseContext();
    },
    []
  );

  return (
    <canvas
      ref={canvasElement}
      width={width}
      height={height}
    />
  );
};

// <- TYPES ->

/**
 * Settings for the sketch
 */
export interface WebGLRendererSettings {
  /** The dimensions for the sketch, in pixels. Defaults to [windowWidth, windowHeight] */
  dimensions?: [number, number];
  /** Used to set if the sketch will be animated, defaults to true */
  isAnimated?: boolean;
  /** Animation setting for the sketch */
  animationSettings?: {
    /** The desired fps to throttle the sketch to - defaults to 60 */
    fps?: number;
    /** A delay (in ms) after which the animation will start */
    delay?: number;
    /** A time (in ms) after which the animation will be stopped */
    endAfter?: number;
  };
}

/**
 * Props to be recieved by the sketch.
 */
export type WebGLDrawProps = {
  /** The WebGL context of the sketch */
  gl: GLContext;
  /** The shader uniforms that you created in the sketches retiurn object. Update these by changing their `value` property */
  uniforms: UniformDict;
  /** The WebGl program */
  program: WebGLProgram;
  /** The width of the sketch - maps to dimensions[0] from the sketch settings */
  width: number;
  /** The width of the sketch - maps to dimensions[1] from the sketch settings */
  height: number;
  /** The aspect ratio of the sketch */
  aspect: number;
} & OnFrameProps;

/**
 * The setup function to be passed into the React component, with access to `ShaderDrawProps`.
 *
 * The contents of this function should contain all sketch state, and can return shaders, uniforms,
 * and an onFrame callback function
 */
export type WebGLSetupFn = (props: WebGLDrawProps) => {
  /**
   * The uniforms to interface with the shaders. The renderer will autmatically detect their gl type (floats must contain a decimal)
   * If auto-detection doesn't work, add `type: "1f"` to the uniform, alongside `value`
   */
  uniforms?: UniformDict;
  /** The vertex shader as a glsl string */
  vert?: string;
  /** The fragment shader as a glsl string */
  frag?: string;
  /** A callback to be run on every frame of the sketch. Here you can update vairables, state, and uniforms */
  onFrame?: WebGLDrawFn;
};

/**
 * The draw function returned by `ShaderSetupFn`, with access to `ShaderDrawProps`.
 *
 * If the sketch is animated, this function will be called every frame.
 */
export type WebGLDrawFn = (props: WebGLDrawProps) => void;

<a href="https://manyworlds.neef.co/" target="_blank" rel="noopener noreferrer">
  <img src="assets/readme-banner.gif" alt="a looping gif of the animations rendered by manyworlds" width="100%">
</a>

# manyworlds 🌌✨🪐👽

A scifi-inspired study of signed distanced functions and noise fields in WebGL.

[Signed Distance Functions](https://en.wikipedia.org/wiki/Signed_distance_function) are fun. With them, you can compute the distance to an object in a metric space, provided you have a function to describe that object's volume. When used alongside [Ray Marching](https://en.wikipedia.org/wiki/Volume_ray_casting) techniques, you can render views of these 3D objects as seen through a 2D plane. This project is an experiment in combining this method with various noise fields, to manipulate and distort these views. This project is named after the [Many-worlds interpretation](https://en.wikipedia.org/wiki/Many-worlds_interpretation) in quantum physics. Nerdy inspirations include old science fiction book covers (such as [Rendezvous with Rama](https://bookmust.wordpress.com/2014/06/08/rendezvous-with-rama/)), and [Starfleet headquarters](https://i2.wp.com/musingsofamiddleagedgeek.files.wordpress.com/2020/11/30d90200-8b80-4ab0-a6c6-ae7f26637f02.jpeg) in season three of Star Trek: Discovery 💁🏾‍♂️

### See experiment: [manyworlds.neef.co](https://manyworlds.neef.co/)

## Project setup

This project is a simple single-page app built with TypeScript & Preact, and bundled with Snowpack & esbuild. The WebGL scene is rendered by a [custom renderer component](https://github.com/neefrehman/manyworlds/blob/main/src/components/WebGL/Renderer.tsx) that uses React/Preact hooks to create and manage a WebGL context. The renderer can accept shader [uniforms](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform), a fragment shader as a glsl string, and an `onFrame` callback used to update the uniforms and other attributes of the sketch. The interfaces for the renderer and callback props can be found in the component's file.

### Tools

- [Preact](https://preactjs.com/) — Teeny React-like library
- [Snowpack](https://www.snowpack.dev/) — ESM-first build tool
- [esbuild](https://esbuild.github.io/) — Blazing fast bundler
- [glslify](https://github.com/glslify/glslify) — Enables importing inside glsl

### Getting Started

To get started on your device, fork this repo and run:

```bash
npm install && npm run start
```

This will set up the (lightning fast, thanks to Snowpack) dev server, and you should be good to go.

#### Fast refresh dev server workaround

As a workaround for [an issue that causes builds to fail](https://github.com/snowpackjs/snowpack/discussions/1458), I've disabled Fast Refresh (via `prefresh`) by commenting out the appropriate lines in `snowpack.config.js` and `.babelrc`.

## Resources

The resources that I've found valuable regarding shaders, Ray Marching, SDFs are:

- [The Book of Shaders](https://thebookofshaders.com/)
- [WebGL Fundamentals](https://webgl2fundamentals.org/)
- [Inigo Quilez's website](https://www.iquilezles.org/www/index.htm) (where the functions for the 3d `sdShapes` in this repo come from)
- [Jamie Wong's Ray Marching and SDF blog post](http://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/)
- [Yuri Artyukh's Ray Marching video tutorial](https://youtu.be/q2WcGi3Cr9w)

## License

This repo is [GNU Licensed](https://github.com/neefrehman/manyworlds/blob/main/LICENSE).

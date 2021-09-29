// 3d distance function shapes in GLSL, sourced from Iñigo Quílez's post:
// https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm

precision highp float;

float ndot(vec2 a, vec2 b ) { return a.x*b.x - a.y*b.y; }

float sdRhombus(vec3 p, float la, float lb, float h, float ra) {
  p = abs(p);
  vec2 b = vec2(la, lb);
  float f = clamp((ndot(b, b-2.0 * p.xz)) / dot(b, b), -1.0, 1.0 );
  vec2 q = vec2(
    length(p.xz - 0.5 * b * vec2(1.0 - f, 1.0 + f)) * sign(p.x * b.y + p.z * b.x - b.x * b.y) - ra,
    p.y - h
  );
  return min(max(q.x, q.y),0.0) + length(max(q, 0.0));
}

// clang-format off
#pragma glslify: export(sdRhombus)
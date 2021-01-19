export type GLContext = WebGLRenderingContext | WebGL2RenderingContext;

/**
 * Utility to throw error on shader compilation failure
 */
export const compileShader = (
    shaderSource: string,
    shaderType: GLContext["VERTEX_SHADER"] | GLContext["FRAGMENT_SHADER"],
    gl: GLContext
): WebGLShader => {
    const shader = gl.createShader(shaderType) as WebGLShader;
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(
            `Shader compile failed with: ${gl.getShaderInfoLog(shader)})`
        );
    }

    return shader;
};

/**
 * Utility to throw error if it fails to find the attribute
 */
export const getAttributeLocation = (
    name: string,
    program: WebGLProgram,
    gl: GLContext
): number => {
    const attributeLocation = gl.getAttribLocation(program, name);

    if (attributeLocation === -1) {
        throw new Error(`Can not find attribute ${name}`);
    }

    return attributeLocation;
};

/**
 * Utility to throw error if it fails to find the uniform
 */
export const getUniformLocation = (
    name: string,
    program: WebGLProgram,
    gl: GLContext
): WebGLUniformLocation => {
    const uniformLocation = gl.getUniformLocation(program, name);

    if (uniformLocation === -1) {
        throw new Error(`Can not find uniform ${name}`);
    }

    return uniformLocation as WebGLUniformLocation;
};

/**
 * Utility to create an attribute to be consumed by the shaders
 */
export const createAttribute = (
    name: string,
    data: Float32Array,
    program: WebGLProgram,
    gl: GLContext
): { buffer: WebGLBuffer; handle: number } => {
    const buffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    const handle = getAttributeLocation(name, program, gl);
    gl.vertexAttribPointer(handle, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(handle);

    return { buffer, handle };
};

/**
 * Utility to set values of already created uniforms
 */
export const setUniform = (
    location: WebGLUniformLocation,
    value: any,
    type: string,
    gl: GLContext
): void => {
    if (type === "1f") gl.uniform1f(location, value);
    if (type === "2f") gl.uniform2f(location, value[0], value[1]);
    if (type === "3f") gl.uniform3f(location, value[0], value[1], value[2]);
    if (type === "4f")
        gl.uniform4f(location, value[0], value[1], value[2], value[3]);

    if (type === "1i") gl.uniform1i(location, value);
    if (type === "2i") gl.uniform2i(location, value[0], value[1]);
    if (type === "3i") gl.uniform3i(location, value[0], value[1], value[2]);
    if (type === "4i")
        gl.uniform4i(location, value[0], value[1], value[2], value[3]);
};

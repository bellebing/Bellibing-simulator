// Isolated artwork presentation only. No Character mechanics, account data or evaluator.
const images = new Map();
function loadImage(url) {
    if (!images.has(url))
        images.set(url, new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(Error('Environment image unavailable'));
            image.src = url;
        }));
    const image = images.get(url);
    images.delete(url);
    images.set(url, image);
    while (images.size > 4)
        images.delete(images.keys().next().value);
    return image;
}
const VERTEX = `attribute vec2 p; varying vec2 uv;
void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`;
const FRAGMENT = `precision highp float;
uniform sampler2D art; uniform sampler2D depth;
uniform vec2 cover; uniform vec2 pointer; uniform vec2 pixels;
varying vec2 uv;
void main(){
 vec2 q=(uv-.5)*cover*.978+.5;
 float d=texture2D(depth,q).r;
 // An authored relative-depth approximation, not reconstructed geometry.
 vec2 offset=pointer*(.45+3.55*d)/pixels;
 vec2 perspective=(q-.5)*dot(pointer,q-.5)*d*.0012;
 gl_FragColor=vec4(texture2D(art,clamp(q+offset+perspective,.001,.999)).rgb,1.);
}`;
export function mountElementalScene(root, { artURL, depthURL, motion, onStatus = () => { } }) {
    const canvas = root.querySelector('.elemental-canvas');
    const host = root.closest('.hero-workspace');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, gl, program, buffer, textures = [], frame = 0, observer;
    let point = [0, 0], target = [0, 0], lastFrame = 0, width = 1, height = 1, artImage;
    const foreground = root.querySelector('.elemental-near');
    const character = root.querySelector('.hero-figure');
    root.style.setProperty('--env-image', `url("${artURL}")`);
    root.style.setProperty('--env-depth', `url("${depthURL}")`);
    const canMove = () => motion && !reduced.matches && !document.hidden;
    function reset() {
        target = [0, 0];
        point = [0, 0];
        character.style.transform = '';
        foreground.style.transform = '';
        cancelAnimationFrame(frame);
        frame = 0;
        if (gl && !disposed && !gl.isContextLost()) {
            // A preference can change during settling before its change event is delivered.
            // Keep reported readiness consistent with the motion guard that stopped the frame.
            const mode = canMove() ? 'depth' : 'still';
            if (root.dataset.motion !== mode) {
                root.dataset.motion = mode;
                onStatus('DEPTH', reduced.matches ? 'Reduced motion active' : undefined);
            }
            paint();
        }
    }
    function paint() {
        if (!gl || disposed || gl.isContextLost())
            return;
        gl.viewport(0, 0, canvas.width, canvas.height);
        const aspect = width / height, sourceAspect = artImage.naturalWidth / artImage.naturalHeight;
        gl.uniform2f(gl.getUniformLocation(program, 'cover'), Math.min(1, aspect / sourceAspect), Math.min(1, sourceAspect / aspect));
        gl.uniform2f(gl.getUniformLocation(program, 'pointer'), ...point);
        gl.uniform2f(gl.getUniformLocation(program, 'pixels'), width, height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        character.style.transform = `translate3d(${point[0] * 1.3}px,${point[1] * .65}px,0)`;
        foreground.style.transform = `translate3d(${-point[0] * 3}px,${-point[1]}px,0) scale(1.023)`;
        root.dataset.frames = String(Number(root.dataset.frames ?? 0) + 1);
    }
    function tick(now) {
        if (disposed || !canMove()) {
            reset();
            return;
        }
        if (now - lastFrame < 32) {
            frame = requestAnimationFrame(tick);
            return;
        }
        lastFrame = now;
        point = point.map((v, i) => v + (target[i] - v) * .18);
        if (Math.abs(point[0] - target[0]) + Math.abs(point[1] - target[1]) < .002) {
            point = [...target];
            paint();
            frame = 0;
            return;
        }
        paint();
        frame = requestAnimationFrame(tick);
    }
    function move(event) {
        if (!gl)
            return;
        if (!canMove()) {
            if (root.dataset.motion === 'depth')
                reset();
            return;
        }
        const b = root.getBoundingClientRect();
        target = [Math.max(-1, Math.min(1, (event.clientX - b.left) / b.width * 2 - 1)), Math.max(-1, Math.min(1, (event.clientY - b.top) / b.height * 2 - 1))];
        if (!frame)
            frame = requestAnimationFrame(tick);
    }
    function resize() {
        const b = root.getBoundingClientRect();
        width = b.width;
        height = b.height;
        // One 2D quad at a bounded raster size; no device-pixel-ratio amplification.
        const scale = Math.min(1, 1920 / width, 1080 / height);
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        paint();
    }
    function fallback(reason) {
        cancelAnimationFrame(frame);
        frame = 0;
        canvas.hidden = true;
        root.dataset.renderer = 'STATIC';
        root.dataset.motion = 'unavailable';
        onStatus('STATIC', reason);
        character.style.transform = '';
        foreground.style.transform = '';
    }
    const lost = event => { event.preventDefault(); fallback('Graphics context unavailable; Cinematic Still retained'); };
    canvas.addEventListener('webglcontextlost', lost);
    const ready = (async () => {
        try {
            const [a, d] = await Promise.all([loadImage(artURL), loadImage(depthURL)]);
            if (disposed)
                return;
            artImage = a;
            if (Math.abs(a.naturalWidth / a.naturalHeight - d.naturalWidth / d.naturalHeight) > .01)
                throw Error('Depth-map framing mismatch');
            gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
            if (!gl)
                throw Error('WebGL unavailable');
            function shader(type, source) { const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
                throw Error('Environment shader unavailable'); return s; }
            const vertex = shader(gl.VERTEX_SHADER, VERTEX), fragment = shader(gl.FRAGMENT_SHADER, FRAGMENT);
            program = gl.createProgram();
            gl.attachShader(program, vertex);
            gl.attachShader(program, fragment);
            gl.linkProgram(program);
            gl.deleteShader(vertex);
            gl.deleteShader(fragment);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS))
                throw Error('Environment shader unavailable');
            gl.useProgram(program);
            buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
            const attribute = gl.getAttribLocation(program, 'p');
            gl.enableVertexAttribArray(attribute);
            gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
            for (const [unit, image, name] of [[0, a, 'art'], [1, d, 'depth']]) {
                const texture = gl.createTexture();
                textures.push(texture);
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.uniform1i(gl.getUniformLocation(program, name), unit);
            }
            root.dataset.renderer = 'DEPTH';
            root.dataset.motion = canMove() ? 'depth' : 'still';
            canvas.hidden = false;
            resize();
            onStatus('DEPTH', reduced.matches ? 'Reduced motion active' : undefined);
            observer = new ResizeObserver(resize);
            observer.observe(root);
        }
        catch (error) {
            if (!disposed)
                fallback(error.message);
        }
    })();
    const preferenceChange = () => { reset(); root.dataset.motion = canMove() ? 'depth' : 'still'; onStatus(root.dataset.renderer, reduced.matches ? 'Reduced motion active' : undefined); };
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', reset);
    reduced.addEventListener('change', preferenceChange);
    document.addEventListener('visibilitychange', reset);
    return { ready, dispose() { disposed = true; cancelAnimationFrame(frame); observer?.disconnect(); host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', reset); reduced.removeEventListener('change', preferenceChange); document.removeEventListener('visibilitychange', reset); canvas.removeEventListener('webglcontextlost', lost); if (gl) {
            for (const t of textures)
                gl.deleteTexture(t);
            if (buffer)
                gl.deleteBuffer(buffer);
            if (program)
                gl.deleteProgram(program);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        } } };
}

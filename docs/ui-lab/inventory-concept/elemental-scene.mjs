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
uniform vec2 movement; uniform vec4 waterBox; uniform float phase; uniform float waterLight;
varying vec2 uv;
void main(){
 vec2 q=(uv-.5)*cover*.978+.5;
 float d=texture2D(depth,q).r;
 // An authored relative-depth approximation, not reconstructed geometry.
 vec2 offset=pointer*movement.x*(.45+3.55*d)/pixels;
 vec2 perspective=(q-.5)*dot(pointer,q-.5)*d*movement.y;
 vec3 color=texture2D(art,clamp(q+offset+perspective,.001,.999)).rgb;
 // Optional local light variation only: no time-dependent geometry displacement.
 vec2 band=smoothstep(waterBox.xy,waterBox.xy+vec2(.04,.015),q)*(1.-smoothstep(waterBox.zw-vec2(.04,.015),waterBox.zw,q));
 float glint=sin(q.y*1100.+sin(q.x*34.)+phase*.55)*sin(q.x*97.-phase*.21);
 color*=1.+waterLight*.018*band.x*band.y*glint;
 gl_FragColor=vec4(color,1.);
}`;
export function mountElementalScene(root, { artURL, depthURL, motion, anchor = null, motionScale = 1, perspective = .0012, ambient = false, water = null, onStatus = () => { } }) {
    const canvas = root.querySelector('.elemental-canvas');
    const host = root.closest('.hero-workspace') ?? root;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, gl, program, buffer, textures = [], frame = 0, observer;
    let point = [0, 0], target = [0, 0], lastFrame = 0, width = 1, height = 1, artImage, anchorDepth = 0;
    const foreground = root.querySelector('.elemental-near');
    const character = root.querySelector('.hero-figure');
    root.style.setProperty('--env-image', `url("${artURL}")`);
    root.style.setProperty('--env-depth', `url("${depthURL}")`);
    const canMove = () => motion && !reduced.matches && !document.hidden;
    const canAnimate = () => ambient && water && !reduced.matches && !document.hidden;
    function framing() {
        const aspect = width / height, sourceAspect = artImage.naturalWidth / artImage.naturalHeight;
        return [Math.min(1, aspect / sourceAspect), Math.min(1, sourceAspect / aspect)];
    }
    function status() {
        const mode = canMove() ? 'depth' : 'still', atmosphere = canAnimate() ? 'water' : 'off';
        if (root.dataset.motion !== mode || root.dataset.ambient !== atmosphere) {
            root.dataset.motion = mode;
            root.dataset.ambient = atmosphere;
            onStatus('DEPTH', reduced.matches ? 'Reduced motion active' : undefined);
        }
    }
    function reset() {
        target = [0, 0];
        point = [0, 0];
        if (character) character.style.transform = '';
        if (foreground) foreground.style.transform = '';
        cancelAnimationFrame(frame);
        frame = 0;
        if (gl && !disposed && !gl.isContextLost() && root.dataset.renderer === 'DEPTH') {
            status();
            paint();
            if (canAnimate()) frame = requestAnimationFrame(tick);
        }
    }
    function paint() {
        if (!gl || disposed || gl.isContextLost() || root.dataset.renderer !== 'DEPTH')
            return;
        gl.viewport(0, 0, canvas.width, canvas.height);
        const cover = framing();
        gl.uniform2f(gl.getUniformLocation(program, 'cover'), ...cover);
        gl.uniform2f(gl.getUniformLocation(program, 'pointer'), ...point);
        gl.uniform2f(gl.getUniformLocation(program, 'pixels'), width, height);
        gl.uniform2f(gl.getUniformLocation(program, 'movement'), motionScale, perspective);
        gl.uniform4f(gl.getUniformLocation(program, 'waterBox'), ...(water ?? [0, 0, 1, 1]));
        gl.uniform1f(gl.getUniformLocation(program, 'phase'), canAnimate() ? performance.now() / 1000 : 0);
        gl.uniform1f(gl.getUniformLocation(program, 'waterLight'), canAnimate() ? 1 : 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (character) {
            // The guide follows its sampled ground plane using the same source-to-screen crop.
            const factor = motionScale * (.45 + 3.55 * anchorDepth) / .978;
            character.style.transform = anchor
                ? `translate3d(${-point[0] * factor / cover[0]}px,${-point[1] * factor / cover[1]}px,0)`
                : `translate3d(${point[0] * 1.3}px,${point[1] * .65}px,0)`;
        }
        if (foreground) foreground.style.transform = `translate3d(${-point[0] * 3}px,${-point[1]}px,0) scale(1.023)`;
        root.dataset.frames = String(Number(root.dataset.frames ?? 0) + 1);
    }
    function tick(now) {
        if (disposed || !gl || gl.isContextLost() || root.dataset.renderer !== 'DEPTH') {
            frame = 0;
            return;
        }
        if (!canMove() && !canAnimate()) {
            reset();
            return;
        }
        if (now - lastFrame < (canAnimate() ? 50 : 32)) {
            frame = requestAnimationFrame(tick);
            return;
        }
        lastFrame = now;
        point = canMove() ? point.map((v, i) => v + (target[i] - v) * .18) : [0, 0];
        if (Math.abs(point[0] - target[0]) + Math.abs(point[1] - target[1]) < .002) {
            point = canMove() ? [...target] : [0, 0];
            paint();
            frame = canAnimate() ? requestAnimationFrame(tick) : 0;
            return;
        }
        paint();
        frame = requestAnimationFrame(tick);
    }
    function move(event) {
        if (!gl || disposed || gl.isContextLost() || root.dataset.renderer !== 'DEPTH')
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
        width = Math.max(1, b.width);
        height = Math.max(1, b.height);
        if (anchor && artImage) {
            const cover = framing(), x = .5 + (anchor.x - .5) / (cover[0] * .978), y = .5 + (anchor.y - .5) / (cover[1] * .978);
            root.style.setProperty('--anchor-x', `${x * width}px`);
            root.style.setProperty('--anchor-y', `${y * height}px`);
            root.style.setProperty('--anchor-width', `${anchor.width * width / (cover[0] * .978)}px`);
            root.style.setProperty('--anchor-height', `${anchor.height * height / (cover[1] * .978)}px`);
        }
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
        root.dataset.ambient = 'off';
        onStatus('STATIC', reason);
        if (character) character.style.transform = '';
        if (foreground) foreground.style.transform = '';
    }
    const lost = event => { event.preventDefault(); fallback('Graphics context unavailable; Cinematic Still retained'); };
    canvas.addEventListener('webglcontextlost', lost);
    const ready = (async () => {
        try {
            const [a, d] = await Promise.all([loadImage(artURL), loadImage(depthURL)]);
            if (disposed)
                return;
            artImage = a;
            if (anchor) {
                const sample = document.createElement('canvas'); sample.width = sample.height = 1;
                const context = sample.getContext('2d');
                context.drawImage(d, anchor.x * d.naturalWidth, anchor.y * d.naturalHeight, 1, 1, 0, 0, 1, 1);
                anchorDepth = context.getImageData(0, 0, 1, 1).data[0] / 255;
            }
            // Frame the guide even when WebGL is unavailable.
            resize();
            observer = new ResizeObserver(resize);
            observer.observe(root);
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
            root.dataset.ambient = canAnimate() ? 'water' : 'off';
            canvas.hidden = false;
            resize();
            onStatus('DEPTH', reduced.matches ? 'Reduced motion active' : undefined);
            if (canAnimate()) frame = requestAnimationFrame(tick);
        }
        catch (error) {
            if (!disposed)
                fallback(error.message);
        }
    })();
    const preferenceChange = () => { reset(); if (root.dataset.renderer === 'DEPTH') { status(); onStatus('DEPTH', reduced.matches ? 'Reduced motion active' : undefined); } };
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

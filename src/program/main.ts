// Copyright (c) 2021 Emmanuel Arias
import "../styles.css";

// @ts-ignore
import CanvasKitInit from '../../node_modules/canvaskit-wasm/bin/canvaskit.js';

import { Canvas, CanvasKit, Surface } from '../../node_modules/canvaskit-wasm/types/index';

CanvasKitInit().then((canvasKit: CanvasKit) => {

    const surface: Surface = canvasKit.MakeCanvasSurface('main_canvas');

    const fps: number = 60;
    const dt: number = 1000 / fps;
    let totalTime: number = 0;
    let currentTime: number = Date.now();

    function gameLoop(canvas: Canvas) {
        //Calcuate the time that has elapsed since the last frame
        const newTime: number = Date.now();
        let frameTime: number = newTime - currentTime;
        currentTime = newTime;

        while (frameTime > 0.0) {
            const deltaTime: number = Math.min(frameTime, dt);

            update(deltaTime);

            frameTime -= deltaTime;
            totalTime += deltaTime;
        }

        render(canvasKit, canvas);

        // @ts-ignore
        surface.requestAnimationFrame(gameLoop);
    }

    // @ts-ignore
    surface.requestAnimationFrame(gameLoop);
});

function update(_deltaTime: number) {
}

function render(canvasKit: CanvasKit, canvas: Canvas) {
    canvas.clear(canvasKit.Color4f(0.3, 0.3, 0.3, 1.0));
}

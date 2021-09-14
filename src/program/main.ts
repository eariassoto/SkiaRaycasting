// Copyright (c) 2021 Emmanuel Arias
import "../styles.css";

// @ts-ignore
import CanvasKitInit from '../../node_modules/canvaskit-wasm/bin/canvaskit.js';

import { Canvas, CanvasKit, Surface, Paint } from '../../node_modules/canvaskit-wasm/types/index';
import { UIAction, WallAxisHit, World } from './world';
import { floor, scale, sum, Vector2D } from "./vector";

const g_World: World = new World();

CanvasKitInit().then((canvasKit: CanvasKit) => {
    addInputEventListeners();

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

function update(deltaTime: number) {
    evaluateMovement(deltaTime);
}

function render(canvasKit: CanvasKit, canvas: Canvas) {
    const floorCol = g_World.getColorForFloor();
    canvas.clear(canvasKit.Color4f(floorCol[0], floorCol[1], floorCol[2], floorCol[3]));

    drawWorld(canvasKit, canvas);
    drawMiniMap(canvasKit, canvas);
}

function evaluateMovement(deltaTime: number) {
    // Using a delta here to deal with both arrows pressed at the time
    let isStrafing = g_World.uiActions.get(UIAction.IS_STRAFING);

    let deltaMov = 0;
    if (g_World.uiActions.get(UIAction.MOVE_FORWARD)) { deltaMov += 1; }
    if (g_World.uiActions.get(UIAction.MOVE_BACKWARD)) { deltaMov -= 1; }

    let deltaRot = 0;
    if (g_World.uiActions.get(UIAction.ROTATE_RIGHT)) { deltaRot += 1; }
    if (g_World.uiActions.get(UIAction.ROTATE_LEFT)) { deltaRot -= 1; }

    if (deltaMov == 0 && deltaRot == 0) { return; }

    const moveSpeed = g_World.playerMovementSpeed;
    const rotSpeed = g_World.playerRotationSpeed;

    const deltaInSec = deltaTime / 1000;
    if (deltaMov == 1) {
        g_World.movePlayerForwards(moveSpeed * deltaInSec);
    }
    else if (deltaMov == -1) {
        g_World.movePlayerBackwards(moveSpeed * deltaInSec);
    }
    //rotate to the right
    if (deltaRot == 1) {
        if (isStrafing) {
            g_World.strafePlayerForwards(moveSpeed * deltaInSec);
        }
        else {
            g_World.rotatePlayerClockWise(-rotSpeed * deltaInSec);
        }
    }
    //rotate to the left
    else if (deltaRot == -1) {
        if (isStrafing) {
            g_World.strafePlayerBackwards(moveSpeed * deltaInSec);
        }
        else {
            g_World.rotatePlayerCounterClockWise(rotSpeed * deltaInSec);
        }
    }
}

function drawMiniMap(canvasKit: CanvasKit, canvas: Canvas) {
    const paint: Paint = new canvasKit.Paint();
    paint.setStyle(canvasKit.PaintStyle.Fill);
    paint.setAntiAlias(true);

    const miniMapPadding = 5;
    const miniMapMargin = 5;

    // Set minimap background color
    paint.setColor(canvasKit.Color4f(0, 0, 0, 1.0));

    const cellSize = 7;
    const backGroundWidth: number = (cellSize * g_World.mapWidth) + (2 * miniMapMargin);
    const backGroundHeight: number = (cellSize * g_World.mapHeight) + (2 * miniMapMargin);

    const backgroundRect = canvasKit.RRectXY(
        canvasKit.XYWHRect(
            // x,y padding
            miniMapPadding,
            miniMapPadding,
            backGroundWidth,
            backGroundHeight
        ),
        0,
        0);
    canvas.drawRRect(backgroundRect, paint);

    // Set color to paint floor
    const floorCol = g_World.getMiniMapColorForFloor();
    paint.setColor(canvasKit.Color4f(floorCol[0], floorCol[1], floorCol[2], floorCol[3]));

    const floorWidth: number = cellSize * g_World.mapWidth;
    const floorHeight: number = cellSize * g_World.mapHeight;

    const floorRect = canvasKit.RRectXY(
        canvasKit.XYWHRect(
            // x,y padding
            miniMapPadding + miniMapMargin,
            miniMapPadding + miniMapMargin,
            floorWidth,
            floorHeight),
        0,
        0);
    canvas.drawRRect(floorRect, paint);

    for (let y = 0; y < g_World.mapHeight; y++) {
        for (let x = 0; x < g_World.mapWidth; x++) {
            const castedY = g_World.getConvertedYCoord(y);
            if (g_World.isWall(x, castedY)) {
                const wallColor = g_World.getMiniMapColorForWall(x, castedY);
                paint.setColor(canvasKit.Color4f(wallColor[0], wallColor[1], wallColor[2], wallColor[3]));

                const wallRec = canvasKit.XYWHRect(
                    miniMapPadding + miniMapMargin + (x * cellSize),
                    miniMapPadding + miniMapMargin + (y * cellSize),
                    cellSize,
                    cellSize
                );
                canvas.drawRRect(wallRec, paint);
            }
        }
    }

    const playerColor = canvasKit.Color4f(1.0, 1.0, 0, 1.0);
    paint.setColor(playerColor);

    const playerSize = 5;
    const playerPosInMapX = miniMapPadding + miniMapMargin + (cellSize * g_World.playerPos.x);
    const playerPosInMapY = miniMapPadding + miniMapMargin + (cellSize * (g_World.mapHeight - g_World.playerPos.y));

    const playerRec = canvasKit.RRectXY(
        canvasKit.XYWHRect(
            playerPosInMapX - (playerSize / 2),
            playerPosInMapY - (playerSize / 2),
            playerSize,
            playerSize
        ), 0, 0);

    canvas.drawRRect(playerRec, paint);

    canvas.drawLine(
        playerPosInMapX,
        playerPosInMapY,
        playerPosInMapX + (1.5 * cellSize * g_World.playerDir.x),
        playerPosInMapY + (1.5 * cellSize * -g_World.playerDir.y),
        paint
    );
}

function drawWorld(canvasKit: CanvasKit, canvas: Canvas) {
    const paint = new canvasKit.Paint();
    paint.setStyle(canvasKit.PaintStyle.Fill);
    paint.setAntiAlias(true);

    for (let i = 0; i < g_World.screenWidth; ++i) {
        // Normalize the current pixel to a value between -1 and 1. 0 will represent
        // the center of the screen
        const cameraX: number = (2 * (i / g_World.screenWidth) - 1);
        //const pointOnCameraPlane = scaleVector(worldStatus.cameraPlane, cameraX);

        // This is the ray from the player to the map for this current pixel on screen.
        // We scaled the screen width and we are using this scale to move across the camera plane.
        const ray: Vector2D = sum(g_World.playerDir, scale(cameraX, g_World.cameraPlane));

        // The algorithm will move this cell until we hit a wall 
        let cellPosition = floor(g_World.playerPos);

        // length of ray from one x or y-side to next x or y-side
        const deltaDistance = new Vector2D(
            Math.abs(1 / ray.x),
            Math.abs(1 / ray.y)
        );

        const step = new Vector2D(
            (ray.x >= 0) ? 1 : -1,
            (ray.y >= 0) ? 1 : -1
        );

        let sideDistance = new Vector2D(0, 0);

        // calculate step and initial sideDist
        if (ray.x < 0) {
            sideDistance.x = (g_World.playerPos.x - cellPosition.x) * deltaDistance.x;
        }
        else {
            sideDistance.x = (1.0 + cellPosition.x - g_World.playerPos.x) * deltaDistance.x;
        }

        if (ray.y < 0) {
            sideDistance.y = (g_World.playerPos.y - cellPosition.y) * deltaDistance.y;
        }
        else {
            sideDistance.y = (1.0 + cellPosition.y - g_World.playerPos.y) * deltaDistance.y;
        }

        let hit = false;
        let wallAxisHit = WallAxisHit.HitX;

        //perform DDA
        while (!hit) {
            //jump to next map square, OR in x-direction, OR in y-direction
            if (sideDistance.x < sideDistance.y) {
                sideDistance.x += deltaDistance.x;
                cellPosition.x += step.x;
                wallAxisHit = WallAxisHit.HitX;
            }
            else {
                sideDistance.y += deltaDistance.y;
                cellPosition.y += step.y;
                wallAxisHit = WallAxisHit.HitY;
            }
            //Check if ray has hit a wall
            if (g_World.isWall(cellPosition.x, cellPosition.y)) {
                hit = true;
            }
        }

        // Calculate distance projected on camera direction (Euclidean distance will give fisheye effect!)
        let perpWallDist = 0;
        if (wallAxisHit == WallAxisHit.HitX) {
            perpWallDist = (cellPosition.x - g_World.playerPos.x + (1 - step.x) / 2) / ray.x;
        }
        else if (wallAxisHit == WallAxisHit.HitY) {
            perpWallDist = (cellPosition.y - g_World.playerPos.y + (1 - step.y) / 2) / ray.y;
        }

        const lineHeight = Math.floor(g_World.screenHeight / perpWallDist);

        let drawStart = -lineHeight / 2 + g_World.screenHeight / 2;
        if (drawStart < 0) { drawStart = 0; }
        let drawEnd = lineHeight / 2 + g_World.screenHeight / 2;
        if (drawEnd >= g_World.screenHeight) { drawEnd = g_World.screenHeight - 1; }

        const wallColor = g_World.getColorForWall(cellPosition.x, cellPosition.y, wallAxisHit);
        paint.setColor(canvasKit.Color4f(wallColor[0], wallColor[1], wallColor[2], wallColor[3]));

        const rr = canvasKit.RRectXY(
            canvasKit.LTRBRect(i, drawStart, i + 1, drawEnd), 0, 0);
        canvas.drawRRect(rr, paint);
    }
}

function addInputEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.code == "ArrowUp" || e.code == "KeyW") {
            g_World.uiActions.set(UIAction.MOVE_FORWARD, true);
        }
        else if (e.code == "ArrowDown" || e.code == "KeyS") {
            g_World.uiActions.set(UIAction.MOVE_BACKWARD, true);
        }
        if (e.code == "ArrowRight" || e.code == "KeyD") {
            g_World.uiActions.set(UIAction.ROTATE_RIGHT, true);
        }
        if (e.code == "ArrowLeft" || e.code == "KeyA") {
            g_World.uiActions.set(UIAction.ROTATE_LEFT, true);
        }
        if (e.code == "Space") {
            g_World.uiActions.set(UIAction.IS_STRAFING, true);
        }
    });
    document.addEventListener('keyup', (e) => {
        if (e.code == "ArrowUp" || e.code == "KeyW") {
            g_World.uiActions.set(UIAction.MOVE_FORWARD, false);
        }
        else if (e.code == "ArrowDown" || e.code == "KeyS") {
            g_World.uiActions.set(UIAction.MOVE_BACKWARD, false);
        }
        if (e.code == "ArrowRight" || e.code == "KeyD") {
            g_World.uiActions.set(UIAction.ROTATE_RIGHT, false);
        }
        if (e.code == "ArrowLeft" || e.code == "KeyA") {
            g_World.uiActions.set(UIAction.ROTATE_LEFT, false);
        }
        if (e.code == "Space") {
            g_World.uiActions.set(UIAction.IS_STRAFING, false);
        }
    });
}

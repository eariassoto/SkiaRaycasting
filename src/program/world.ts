// Copyright (c) 2021 Emmanuel Arias

import { rotateCounterClock, scale, Vector2D } from "./vector";

export enum WallAxisHit {
    HitX,
    HitY,
};

export enum UIAction {
    MOVE_FORWARD,
    MOVE_BACKWARD,
    ROTATE_RIGHT,
    ROTATE_LEFT,
    IS_STRAFING
};

export class World {
    readonly screenWidth: number = (document.getElementById('main_canvas') as HTMLCanvasElement).width;
    readonly screenHeight: number = (document.getElementById('main_canvas') as HTMLCanvasElement).height;

    readonly mapWidth: number = 24;
    readonly mapHeight: number = 24;

    private _playerPos: Vector2D = new Vector2D(11.5, 1.5);
    private _playerDir: Vector2D = new Vector2D(0, 1);
    private _cameraPlane: Vector2D = new Vector2D(0.66, 0);

    private _playerFrontCollisionDistance: number = 0.25;
    private _playerMovementSpeed: number = 3.75;
    private _playerRotationSpeed: number = 1.309; // 75 degree

    get playerPos() {
        return this._playerPos;
    }

    get playerDir() {
        return this._playerDir;
    }

    get cameraPlane() {
        return this._cameraPlane;
    }

    get playerMovementSpeed() {
        return this._playerMovementSpeed;
    }

    get playerRotationSpeed() {
        return this._playerRotationSpeed;
    }

    private worldMap: number[] =
        [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 2, 0, 2, 0, 5, 0, 2, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 4, 4, 4, 4, 4,
            1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 4, 0, 0, 0, 4,
            1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 2, 2, 2, 2, 1, 1, 1, 4, 0, 0, 0, 4,
            3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 2, 0, 2, 3, 3, 3, 3, 3, 3, 4, 0, 0, 0, 4,
            3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4,
            3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 3, 0, 3, 3, 3, 3, 3, 3, 3, 4, 0, 0, 0, 4,
            4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 3, 0, 3, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 4,
            4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 0, 3, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4,
            4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 0, 0, 1, 0, 0, 4, 0, 0, 0, 4,
            4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 0, 3, 4, 0, 0, 0, 0, 0, 4, 4, 0, 4, 4,
            4, 0, 1, 0, 1, 0, 0, 0, 0, 4, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 4,
            4, 0, 0, 1, 0, 0, 0, 0, 0, 4, 3, 0, 3, 4, 0, 0, 0, 0, 0, 4, 4, 0, 4, 4,
            4, 0, 1, 0, 1, 0, 0, 0, 0, 4, 3, 0, 3, 4, 0, 0, 1, 0, 0, 4, 0, 0, 0, 4,
            4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 0, 3, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4,
            4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        ];

    private wallColors: number[][] = [
        [0.4, 0.25, 0.13, 1.0],
        [0.13, 0.4, 0.25, 1.0],
        [0.4, 0.13, 0.25, 1.0],
        [0.25, 0.13, 0.4, 1.0],
        [0.82, 0.68, 0.21, 1.0]
    ];

    private miniMapFloorColor: number[] = [0.5, 0.5, 0.5, 1.0];
    private floorColor: number[] = [0.8, 0.8, 0.8, 1.0];

    uiActions: Map<UIAction, boolean> = new Map<UIAction, boolean>([
        [UIAction.MOVE_FORWARD, false],
        [UIAction.MOVE_BACKWARD, false],
        [UIAction.ROTATE_RIGHT, false],
        [UIAction.ROTATE_LEFT, false],
        [UIAction.IS_STRAFING, false]
    ]);

    getMiniMapColorForWall(x: number, y: number): number[] {
        const cell = this.getWorldMapCell(x, y);
        if (cell == 0) {
            console.error("Error trying to get color for not a wall in ", x, y);
        }
        return this.wallColors[cell - 1];
    };

    getColorForWall(x: number, y: number, wallAxisHit: WallAxisHit): number[] {
        const cell = this.getWorldMapCell(x, y);
        if (cell == 0) {
            console.error("Error trying to get color for not a wall in ", x, y);
        }
        if (wallAxisHit == WallAxisHit.HitX) {
            return this.wallColors[cell - 1];
        }
        else if (wallAxisHit == WallAxisHit.HitY) {
            return this.wallColors[cell - 1].map((item, index) => {
                if (index == 3) {
                    // Alpha channel stays the same
                    return item;
                } else {
                    return item / 2;
                }
            });
        }
        return [];
    };

    getConvertedYCoord(y: number): number {
        if (y > this.mapHeight - 1) {
            // TODO: WARN
            return -1;
        }
        return this.mapHeight - 1 - y;
    };

    getWorldMapCell(x: number, y: number): number {
        // The coordinates we receive as parameter are top left coordinates, convert the Y axis
        // to bottom-left coordinates
        return this.worldMap[this.getConvertedYCoord(y) * this.mapWidth + x];
    };

    isWall(x: number, y: number): boolean {
        const realX = Math.floor(x);
        const realY = Math.floor(y);
        return this.getWorldMapCell(realX, realY) > 0;
    };

    canWalkThrough(x: number, y: number): boolean {
        return !this.isWall(x, y);
    };

    getColorForFloor(): number[] {
        return this.floorColor;
    }

    getMiniMapColorForFloor(): number[] {
        return this.miniMapFloorColor;
    }

    movePlayerForwards(distance: number) {
        const newDistance = scale(distance, this.playerDir);
        // when moving forwards we need to check against the position plus the collision distance
        const distanceWithCollisionSpace = scale((distance + this._playerFrontCollisionDistance), this.playerDir);

        if (this.canWalkThrough(this.playerPos.x + distanceWithCollisionSpace.x, this.playerPos.y)) {
            this.playerPos.x += newDistance.x;
        }
        if (this.canWalkThrough(this.playerPos.x, this.playerPos.y + distanceWithCollisionSpace.y)) {
            this.playerPos.y += newDistance.y;
        }
    };

    movePlayerBackwards(distance: number) {
        const newDistance = scale(distance, this.playerDir);
        if (this.canWalkThrough(this.playerPos.x - newDistance.x, this.playerPos.y)) {
            this.playerPos.x -= newDistance.x;
        }
        if (this.canWalkThrough(this.playerPos.x, this.playerPos.y - newDistance.y)) {
            this.playerPos.y -= newDistance.y;
        }
    };

    strafePlayerForwards(distance: number) {
        const newDistance = scale(distance, this.cameraPlane);
        // strafing involves moving forwards, check distance with collision distance
        const distanceWithCollisionSpace = scale((distance + this._playerFrontCollisionDistance), this.cameraPlane);

        if (this.canWalkThrough(this.playerPos.x + distanceWithCollisionSpace.x, this.playerPos.y)) {
            this.playerPos.x += newDistance.x;
        }
        if (this.canWalkThrough(this.playerPos.x, this.playerPos.y + distanceWithCollisionSpace.y)) {
            this.playerPos.y += newDistance.y;
        }
    };

    strafePlayerBackwards(distance: number) {
        const newDistance = scale(distance, this.cameraPlane);
        // strafing involves moving forwards, check distance with collision distance
        const distanceWithCollisionSpace = scale((distance + this._playerFrontCollisionDistance), this.cameraPlane);

        if (this.canWalkThrough(this.playerPos.x - distanceWithCollisionSpace.x, this.playerPos.y)) {
            this.playerPos.x -= newDistance.x;
        }
        if (this.canWalkThrough(this.playerPos.x, this.playerPos.y - distanceWithCollisionSpace.y)) {
            this.playerPos.y -= newDistance.y;
        }
    };

    rotatePlayerClockWise(angle: number) {
        this._playerDir = rotateCounterClock(this.playerDir, angle);
        this._cameraPlane = rotateCounterClock(this.cameraPlane, angle);
    };

    rotatePlayerCounterClockWise(angle: number) {
        this._playerDir = rotateCounterClock(this.playerDir, angle);
        this._cameraPlane = rotateCounterClock(this.cameraPlane, angle);
    };
};

// Copyright (c) 2021 Emmanuel Arias
export class Vector2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
};

export function sum(v1: Vector2D, v2: Vector2D): Vector2D {
    return new Vector2D(
        v1.x + v2.x,
        v1.y + v2.y
    );
}

export function subtract(v1: Vector2D, v2: Vector2D): Vector2D {
    return new Vector2D(
        v1.x - v2.x,
        v1.y - v2.y
    );
}

export function scale(k: number, vec: Vector2D): Vector2D {
    return new Vector2D(
        k * vec.x,
        k * vec.y
    );
}

export function floor(vec: Vector2D): Vector2D {
    return new Vector2D(
        Math.floor(vec.x),
        Math.floor(vec.y)
    );
}

export function rotateCounterClock(vec: Vector2D, degree: number) {
    return new Vector2D(
        vec.x * Math.cos(degree) - vec.y * Math.sin(degree),
        vec.x * Math.sin(degree) + vec.y * Math.cos(degree),
    );
}

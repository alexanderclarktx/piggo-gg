import { Component } from "@piggo-legends/core";

export type PositionOffset = "world" | "camera";

// the position component tracks the player's position
export class Position implements Component<"position"> {
    type: "position";

    x: number;
    y: number;
    offset: PositionOffset;

    constructor(x: number, y: number, offset: PositionOffset = "world") {
        this.x = x;
        this.y = y;
        this.offset = offset;
    }
}

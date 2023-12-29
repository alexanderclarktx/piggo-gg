import { Component } from "@piggo-legends/core";

// the Experience component tracks the player's experience and level
export class Experience implements Component<"experience"> {
    type: "experience";

    xp: number;
    level: number;

    constructor(xp: number, level: number) {
        this.xp = xp;
        this.level = level;
    }
}

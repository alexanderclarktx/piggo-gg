import { Component } from "@piggo-legends/core";

// the Experience component tracks the player's experience and level
export class Experience implements Component<"experience"> {
    xp: number;
    level: number;
    type: "experience";

    constructor(xp: number, level: number) {
        this.xp = xp;
        this.level = level;
    }
}

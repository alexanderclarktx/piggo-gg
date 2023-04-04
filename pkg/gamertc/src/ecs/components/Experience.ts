import { Component } from "@piggo-legends/gamertc";

// the Experience component tracks the player's experience and level
export class Experience extends Component {
    xp: number;
    level: number;

    constructor(xp: number, level: number) {
        super();
        this.xp = xp;
        this.level = level;
    }
}

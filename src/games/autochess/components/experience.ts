import { Component } from "../../shared/ecs";

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

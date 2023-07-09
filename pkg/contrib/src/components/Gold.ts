import { Component } from "@piggo-legends/core";

// the gold component tracks the player's gold
export class Gold implements Component<"gold"> {
    gold: number;
    type: "gold";

    constructor(gold: number) {
        this.gold = gold;
    }
}

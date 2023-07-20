import { Component, Entity, EntityProps, Game, GameProps } from "@piggo-legends/core";

export type Bounds = { x: number, y: number, w: number, h: number };

export type InteractiveProps = {
  active: boolean
  bounds: Bounds
  onPress?: (entity: Entity<EntityProps>, game: Game<GameProps>) => void
}

export class Interactive implements Component<"interactive"> {
  type: "interactive";
  active: boolean;
  bounds: Bounds;
  onPress: undefined | ((entity: Entity<EntityProps>, game: Game<GameProps>) => void);

  constructor(props: InteractiveProps) {
    this.active = props.active;
    this.bounds = props.bounds;
    this.onPress = props.onPress;
  }
}

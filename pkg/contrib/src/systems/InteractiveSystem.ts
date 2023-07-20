import { Entity, EntityProps, Game, GameProps, System, SystemProps } from "@piggo-legends/core";
import { Interactive } from "@piggo-legends/contrib";

export type Click = {
  x: number;
  y: number;
}

export class InteractiveSystem extends System<SystemProps> {
  componentTypeQuery = ["interactive"];

  bufferClick: Click[] = [];

  constructor(props: SystemProps) {
    super(props);
    this.init();
  }

  init = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const camera = this.props.renderer.camera;

    canvas.addEventListener("pointerdown", (event) => {
      const rect = canvas.getBoundingClientRect()
      const x = Math.round(event.clientX - rect.left - 2);
      const y = Math.round(event.clientY - rect.top - 2);
      this.bufferClick.push(camera.toWorldCoords({ x, y }));
    });
  }

  onTick = (entities: Entity<EntityProps>[], game: Game<GameProps>) => {
    for (const entity of entities) {
      const interactive = entity.props.components.interactive as Interactive;
      if (interactive.active) {
        for (const click of this.bufferClick) {
          if (
            click.x >= interactive.bounds.x && click.x <= interactive.bounds.x + interactive.bounds.w &&
            click.y >= interactive.bounds.y && click.y <= interactive.bounds.y + interactive.bounds.h
          ) {
            if (interactive.onPress) interactive.onPress(entity, game);
          }
        }
      }
    }
    this.bufferClick = [];
  }
}

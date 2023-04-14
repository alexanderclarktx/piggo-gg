import { Renderer, Entity, System, NetManager, SystemProps } from "@piggo-legends/core";
import { Skelly } from "@piggo-legends/contrib"

export type GameProps = {
  net: NetManager,
  renderer: Renderer,
  entities?: Entity<any>[],
  systems?: System<SystemProps>[]
}

export abstract class Game<T extends GameProps> {
  props: T;
  tick: number = 0;
  otherPlayer: Entity<any>;

  constructor(props: T) {
    this.props = props;
    this._init();
  }

  _init = () => {
    // ontick
    this.props.renderer.app.ticker.add(this.onTick);

    // callback for netcode
    this.props.net.events.addEventListener("message", (evt: CustomEvent<any>) => {
      if (!this.otherPlayer) {
        this.otherPlayer = new Skelly({
          id: "skelly2",
          renderer: this.props.renderer
        });
        this.props.entities?.push(this.otherPlayer);
      }
      const data = evt.detail;
      if (data.type === "game" && this.otherPlayer.renderable) {
        const pos = data.data.entities[0];
        this.otherPlayer.renderable.c.position.x = parseFloat(pos.x);
        this.otherPlayer.renderable.c.position.y = parseFloat(pos.y);
      }
    });
  }

  onTick = () => {
    this.tick += 1;

    // systems onTick
    this.props.systems?.forEach((system) => {
      system.onTick(this.props.entities ?? []);
    });

    // add entities to renderer that haven't been added yet
    for (const entity of this.props.entities ?? []) {
      if (!entity.rendered) {
        if (entity.renderable) {
          this.props.renderer.addWorld(entity.renderable);
          entity.rendered = true;
        }
      }
    }

    const serializedEntitites: {x: number, y: number}[] = [];
    for (const entity of this.props.entities ?? []) {
      const serialized = entity.serialize();
      if (serialized) serializedEntitites.push(serialized);
    }

    const message = {
      type: "game",
      data: {
        tick: this.tick,
        entities: serializedEntitites
      }
    }

    this.props.net.sendMessage(message);
  }
}

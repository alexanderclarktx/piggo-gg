import { Renderer } from "../graphics/Renderer";
import { Entity, EntityProps } from "../ecs/Entity";
import { System } from "../ecs/System";
import { Character, NetManager, Skelly, TextBox } from "../main";

export type GameProps = {
  net: NetManager,
  renderer: Renderer,
  entities?: Entity<any>[],
  systems?: System[]
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
          renderer: this.props.renderer
        });
        this.props.entities?.push(this.otherPlayer);
      }
      const data = evt.detail;
      if (data.type === "game" && this.otherPlayer.renderable) {
        const pos = data.data.entities[0];
        this.otherPlayer.renderable.position.x = parseFloat(pos.x);
        this.otherPlayer.renderable.position.y = parseFloat(pos.y);
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

import { Renderer, Entity, System, NetManager, SystemProps } from "@piggo-legends/core";

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

  addEntity = (entity: Entity<any>) => {
    this.props.entities?.push(entity);
  }

  _init = () => {
    // ontick
    this.props.renderer.app.ticker.add(this.onTick);

    // callback for netcode
    this.props.net.events.addEventListener("message", (evt: CustomEvent<any>) => {
      // if (!this.otherPlayer) {
      //   this.otherPlayer = new Skelly({
      //     id: "skelly2",
      //     renderer: this.props.renderer
      //   });
      //   this.props.entities?.push(this.otherPlayer);
      // }
      // TODO network system
      // const data = evt.detail;
      // if (data.type === "game" && this.otherPlayer.renderable) {
      //   const pos = data.data.entities[0];
      //   this.otherPlayer.renderable.c.position.x = parseFloat(pos.x);
      //   this.otherPlayer.renderable.c.position.y = parseFloat(pos.y);
      // }
    });
  }

  onTick = () => {
    this.tick += 1;

    // systems onTick
    this.props.systems?.forEach((system) => {
      system.onTick(system.getFilteredEntities(this.props.entities ?? []), this);
    });

    // TODO netcode system
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

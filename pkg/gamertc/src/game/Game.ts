import { Renderer } from "../graphics/Renderer";
import { Entity } from "../ecs/Entity";
import { System } from "../ecs/System";
import { NetManager, TextBox } from "../main";

export type GameProps = {
  net: NetManager,
  renderer: Renderer,
  entities?: Entity[],
  systems?: System[]
}

export abstract class Game<T extends GameProps> {
  props: T;

  constructor(props: T) {
    this.props = props;
    this._init();
  }

  _init = () => {
    this.props.net.events.addEventListener("message", (evt: CustomEvent<string>) => {
      console.log("EVENT FROM NETMANAGER", evt);
      this.props.renderer.addHUD(new TextBox({
        renderer: this.props.renderer,
        text: evt.detail,
        pos: { x: 50, y: 100 },
        timeout: 1500
      }));
    });
  }

  onTick = () => {
    console.log("tick");
    this.props.systems?.forEach((system) => {
      system.onTick(this.props.entities ?? []);
    });
  }
}

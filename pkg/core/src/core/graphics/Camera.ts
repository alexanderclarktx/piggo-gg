import { Renderable, RenderableProps } from "@piggo-legends/core";


export class Camera extends Renderable<RenderableProps> {
  renderables: Set<Renderable<RenderableProps>> = new Set();

  constructor(props: RenderableProps) {
    super({
      ...props,
      pos: { x: 0, y: 0 },
      debuggable: false,
    });
  }

  add = (r: Renderable<RenderableProps>) => {
    this.c.addChild(r.c);
    this.renderables.add(r);
  }

  moveTo = (x: number, y: number) => {
    this.c.x = +(this.props.renderer.app.screen.width / 2 - x).toFixed(2);
    this.c.y = +(this.props.renderer.app.screen.height / 2 - y).toFixed(2);

    this.renderables.forEach(r => {
      if (r.props.cameraPosition) {
        r.c.x = r.props.cameraPosition.x - this.c.x;
        r.c.y = r.props.cameraPosition.y - this.c.y;
      }
    });
  }
}

import { Renderable, RenderableProps } from "@piggo-legends/core";

export class Camera extends Renderable<RenderableProps> {
  renderables: Set<Renderable<RenderableProps>> = new Set();

  constructor(props: RenderableProps) {
    super({
      ...props,
      pos: { x: 0, y: 0 },
      debuggable: false
    });
  }

  add = (r: Renderable<RenderableProps>) => {
    this.renderables.add(r);
    this.c.addChild(r.c);
  }

  moveTo = (x: number, y: number) => {
    this.c.x = +(this.props.renderer.app.screen.width / 2 - x).toFixed(2);
    this.c.y = +(this.props.renderer.app.screen.height / 2 - y).toFixed(2);

    this.handleCameraPos();
  }

  handleCameraPos = () => {
    for (const r of this.renderables) {
      if (r.props.cameraPos) {

        // if cameraPos.x is negative, offset from right of the screen
        if (r.props.cameraPos.x < 0) {
          r.c.x = this.props.renderer.app.screen.width + r.props.cameraPos.x - this.c.x;
        } else {
          r.c.x = r.props.cameraPos.x - this.c.x;
        }

        // if cameraPos.y is negative, offset from bottom of the screen
        if (r.props.cameraPos.y < 0) {
          r.c.y = this.props.renderer.app.screen.height + r.props.cameraPos.y - this.c.y;
        } else {
          r.c.y = r.props.cameraPos.y - this.c.y;
        }
      }
    }
  }
}

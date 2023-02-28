import { Application, Graphics } from 'pixi.js'
import '@pixi/unsafe-eval';
import { WebRTC } from '@piggo-legends/gamertc';

const app = new Application({
    view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x6495ed,
    width: 800,
    height: 600
});

const graphy: Graphics = new Graphics();

graphy.beginFill(0xFF00FF);
graphy.lineStyle(10, 0x00FF00);
graphy.drawCircle(200, 200, 25);
graphy.endFill();

app.stage.addChild(graphy);

// import the webrtc library

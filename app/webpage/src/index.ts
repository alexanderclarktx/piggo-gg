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
const client = new WebRTC();
window["client"] = client;

// accept an offer
const buttonAcceptOffer = document.getElementById("button-accept-offer") as HTMLButtonElement
const inputAcceptOffer = document.getElementById("input-accept-offer") as HTMLInputElement
const pAnswer = document.getElementById("p-answer") as HTMLParagraphElement

buttonAcceptOffer.onclick = async () => {
    const offer = atob(inputAcceptOffer.value);
    const answer = await client.acceptOffer(offer);
    pAnswer.innerText = btoa(answer);
}

// send an offer
const buttonSendOffer = document.getElementById("button-send-offer") as HTMLButtonElement
const pOffer = document.getElementById("p-offer") as HTMLParagraphElement

// accept an answer
const inputAnswer = document.getElementById("input-answer") as HTMLInputElement
const buttonAnswer = document.getElementById("button-answer") as HTMLButtonElement

buttonSendOffer.onclick = async () => {
    client.createOffer((offer: string) => {
        pOffer.innerText = btoa(offer);

        // unhide the answer input
        inputAnswer.hidden = false;
        buttonAnswer.hidden = false;

        // hide accept offer
        buttonAcceptOffer.hidden = true;
        inputAcceptOffer.hidden = true;
    });
}

buttonAnswer.onclick = async () => {
    const answer = atob(inputAnswer.value);
    await client.acceptAnswer(answer);
}

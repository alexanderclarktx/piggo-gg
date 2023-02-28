import { WebRTC } from "../src/webrtc"

const webrtc = new WebRTC();
const offer = webrtc.createOffer();
offer.then((offer) => {
  console.log("offer", offer);
});

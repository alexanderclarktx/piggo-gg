import '@pixi/unsafe-eval';
import React, { useEffect, useState } from 'react';
import { GameRTC, NetManager } from '@piggo-legends/gamertc';
import { Renderer } from '@piggo-legends/gamertc/src/graphics/renderer';
import { WebRTCHandshake } from './WebRTCHandshake';

export const GameCanvas = () => {
  const [gameRTC, setGameRTC] = useState<GameRTC | undefined>();

  const [theirMediaStream, setTheirMediaStream] = useState<MediaStream | undefined>();
  const [sdp, setSdp] = useState({ local: "", remote: "" });
  const [rtcState, setRtcState] = useState<"none" | "offering" | "answering" | "connected">("none");

  useEffect(() => {
    setGameRTC(
      new GameRTC(
        new NetManager(
          (local: string) => {
            console.log("updated local", local);
            setSdp({
              local: btoa(local),
              remote: sdp.remote
            });
          },
          (stream: MediaStream) => {
            console.log("got media");
            setTheirMediaStream(stream);
          },
          () => {
            console.log("connected!");
            setRtcState("connected");
          }
        ),
        undefined,
        new Renderer(
          document.getElementById("canvas") as HTMLCanvasElement
        )
      )
    );
  }, []);

  return (
      <div id="game">
        <WebRTCHandshake
          gameRTC={gameRTC}
          sdp={sdp}
          setSdp={setSdp}
          rtcState={rtcState}
          setRtcState={setRtcState}
          theirMediaStream={theirMediaStream}
        />
      </div>
  );
}

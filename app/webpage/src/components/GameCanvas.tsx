import '@pixi/unsafe-eval';
import React, { useEffect, useState } from 'react';
import { GameClient, NetManager } from '@piggo-legends/gamertc';
import { Renderer } from '@piggo-legends/gamertc/src/graphics/renderer';
import { WebRTCHandshake, NetState } from './WebRTCHandshake';

export const GameCanvas = () => {
  const [gameClient, setGameClient] = useState<GameClient | undefined>();

  const [theirMediaStream, setTheirMediaStream] = useState<MediaStream | undefined>();
  const [sdp, setSdp] = useState({ local: "", remote: "" });
  const [netState, setNetState] = useState<NetState>("none");

  const onLocalUpdated = (local: string) => {
    console.log("updated local", local);
    setSdp({ local: btoa(local), remote: sdp.remote });
  }

  const onMedia = (stream: MediaStream) => {
    console.log("got media");
    setTheirMediaStream(stream);
  }

  const onConnected = () => {
    console.log("connected!");
    setNetState("connected");
  }

  useEffect(() => {
    setGameClient(
      new GameClient(
        new NetManager(onLocalUpdated, onMedia, onConnected),
        undefined,
        new Renderer(document.getElementById("canvas") as HTMLCanvasElement)
      )
    );
  }, []);

  return (
      <div id="game">
        <WebRTCHandshake
          gameClient={gameClient}
          sdp={sdp}
          setSdp={setSdp}
          netState={netState}
          setNetState={setNetState}
          theirMediaStream={theirMediaStream}
        />
      </div>
  );
}

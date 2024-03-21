import React from "react";
import { NetState, NetStateColor } from "../types/NetState";
import { World, DelayClientSystem } from "@piggo-gg/core";

export type WsNetConnectorProps = {
  world: World | undefined
  setNetState: (state: NetState) => void
  netState: NetState
}

export const WsNetConnector = ({ world, setNetState, netState }: WsNetConnectorProps) => {

  setInterval(() => {
    world?.isConnected ? setNetState("connected") : setNetState("disconnected");
  }, 200)

  const onClick = () => {
    if (world) world.addSystemBuilders([DelayClientSystem])
  }

  const fullscreenOnclick = () => {
    const canvas = world?.renderer?.app.canvas;
    if (!canvas) return;

    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
      // @ts-expect-error
    } else if (canvas.mozRequestFullScreen) { /* Firefox */
      // @ts-expect-error
      canvas.mozRequestFullScreen();
      // @ts-expect-error
    } else if (canvas.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      // @ts-expect-error
      canvas.webkitRequestFullscreen();
      // @ts-expect-error
    } else if (canvas.msRequestFullscreen) { /* IE/Edge */
      // @ts-expect-error
      canvas.msRequestFullscreen();
    }
  }

  return (
    <div style={{ "paddingTop": 0 }}>
      <div style={{ width: "100%" }}>
        <div style={{ float: "left", marginLeft: 0, paddingLeft: 0, marginTop: 1 }}>
          <button style={{ fontSize: 12, marginLeft: 0 }} onClick={fullscreenOnclick}>fullscreen</button>
          <button style={{ fontSize: 12, marginLeft: 0 }} onClick={onClick}>connect</button>
          <span style={{ color: NetStateColor[netState], paddingTop: 2 }}>{netState}</span>
        </div>
      </div>
    </div>
  )
}

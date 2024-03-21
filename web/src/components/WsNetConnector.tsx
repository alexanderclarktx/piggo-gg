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
    world?.renderer?.app.canvas.requestFullscreen();
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

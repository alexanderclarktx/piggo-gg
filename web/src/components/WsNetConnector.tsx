import { World } from "@piggo-gg/core";
import { NetState } from "@piggo-gg/web";
import React from "react";

const colors: Record<NetState, string> = {
  "disconnected": "red",
  "offering": "yellow",
  "answering": "orange",
  "connected": "lightgreen"
}

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
    if (world && world.client) world.client.joinLobby("hub", () => { });
  }

  return (
    <div style={{ "paddingTop": 0 }}>
      <div style={{ width: "100%" }}>
        <div style={{ float: "left", marginLeft: 0, paddingLeft: 0, marginTop: 1 }}>
          {/* <button style={{ fontSize: 12, marginLeft: 0 }} onClick={onClick}>connect</button> */}
          <span style={{ color: colors[netState], fontSize: 14, fontFamily: "sans-serif", paddingTop: 2 }}>{netState}</span>
        </div>
      </div>
    </div>
  )
}

import React from "react";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { WsNetConnector, WsNetConnectorProps } from "./WsNetConnector";

export type HeaderProps = WsNetConnectorProps & {}

export const Header = ({ world, netState, setNetState }: HeaderProps) => {
  return (
    <div style={{
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      userSelect: "none",
      margin: 0,
      marginBottom: 5
    }}>
      {/* <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}>
        <WsNetConnector netState={netState} setNetState={setNetState} world={world} />
      </div> */}
      <h1 style={{ textAlign: "center", fontFamily: "Brush Script MT", margin: "0 10px" }}>
        Piggo Legends
      </h1>
      <div style={{ position: 'absolute', left: 0 }}>
        <a style={{ margin: 0, color: "inherit", textDecoration: "none" }} target="_blank" href="https://discord.gg/VfFG9XqDpJ">
          <FaDiscord size={20} style={{ color: "white", marginTop: 8 }}></FaDiscord>
        </a>
      </div>
      <div style={{ position: 'absolute', right: 0 }}>
        <a style={{ margin: 0, color: "inherit", textDecoration: "none" }} target="_blank" href="https://github.com/alexanderclarktx/piggo-legends">
          <span style={{ fontFamily: "sans-serif", fontSize: 14, marginRight: 5, verticalAlign: "15%" }}>
            v<b>0.1.7</b>
          </span>
          <FaGithub size={20} style={{ color: "white", marginTop: 8 }}></FaGithub>
        </a>
      </div>
    </div>
  );
}

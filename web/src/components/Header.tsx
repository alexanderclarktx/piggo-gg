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
      <div style={{ position: 'absolute', left: 0, bottom: 0 }}>
        <WsNetConnector netState={netState} setNetState={setNetState} world={world} />
      </div>
      <h1 style={{ textAlign: "center", fontFamily: "Courier New", fontSize: 36, textShadow: "1px 1px purple" , margin: "0 10px" }}>
        Piggo
      </h1>
      <div style={{ position: 'absolute', right: 0, bottom: 0 }}>
        <span style={{ fontFamily: "sans-serif", fontSize: 14, marginRight: 5, verticalAlign: "-70%" }}>
          v<b>0.3.10</b>
        </span>
        <a style={{ margin: 0, color: "inherit", textDecoration: "none" }} target="_blank" href="https://discord.gg/VfFG9XqDpJ">
          <FaDiscord size={20} style={{ color: "white", verticalAlign: "-80%" }}></FaDiscord>
        </a>
        <a style={{ margin: 0, color: "inherit", textDecoration: "none" }} target="_blank" href="https://github.com/alexanderclarktx/piggo-gg">
          <FaGithub size={20} style={{ color: "white", verticalAlign: "-70%", marginLeft: 5 }}></FaGithub>
        </a>
      </div>
    </div>
  );
}

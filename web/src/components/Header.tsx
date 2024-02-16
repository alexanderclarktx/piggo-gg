import React from "react";
import { FaGithub } from "react-icons/fa";

export const Header = () => {
  return (
    <div style={{
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      userSelect: "none",
      margin: 10
    }}>
      <h1 style={{ textAlign: "center", fontFamily: "Brush Script MT", margin: "0 10px" }}>Piggo Legends</h1>
      <div style={{
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
      }}>
        <a target="_blank" href="https://github.com/alexanderclarktx/piggo-legends">
          <FaGithub size={20} style={{ color: "white", marginTop: 8 }}></FaGithub>
        </a>
      </div>
    </div>
  );
}

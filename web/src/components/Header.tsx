import React from "react";
import { FaGithub } from "react-icons/fa";

export const Header = () => {
  return (
    <div style={{
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: 10
    }}>
      <h1 style={{ textAlign: "center", fontFamily: "Brush Script MT", margin: "0 10px" }}>Piggo Legends</h1>
      <div style={{
        position: 'absolute', // Icon is positioned absolutely
        right: 0, // Pushed to the right
        top: '50%', // Centered vertically
        transform: 'translateY(-50%)', // Adjusts the precise centering
      }}>
        <a target="_blank" href="https://github.com/alexanderclarktx/piggo-legends">
          <FaGithub size={15} style={{ color: "white", marginTop: 6 }}></FaGithub>
        </a>
      </div>
      {/* <div><a target="_blank" href="https://github.com/alexanderclarktx/piggo-legends">
        <FaGithub size={15} style={{ color: "white", marginTop: 6 }}></FaGithub>
      </a></div> */}
    </div>
  );
}

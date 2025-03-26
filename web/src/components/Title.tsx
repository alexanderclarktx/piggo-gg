import { Login, LoginProps } from "@piggo-gg/web"
import { FaDiscord, FaGithub } from "react-icons/fa"

export type TitleProps = LoginProps & {}

export const Title = ({ world, loginState, setLoginState }: TitleProps) => {

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
        <Login loginState={loginState} setLoginState={setLoginState} world={world} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <h1 style={{ fontFamily: "Courier New", fontSize: 38, margin: "0 10px" }}>
          Piggo
        </h1>
        <svg width="35" height="35" viewBox="0 0 160 170" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="90" fill="#FFC0CB" r="79" />

          <path d="m10,53c0,-61.32 10.11,-51.43 50.54,-39.56" fill="#FFC0CB" transform="matrix(1, 0, 0, 1, 0, 0)" />
          <path d="m150,53c0,-61.32 -10.16,-51.43 -50.81,-39.56" fill="#FFC0CB" />

          <path d="m33.33,68.61q13.33,-22.22 26.67,0" fill="none" stroke="black" stroke-linecap="round" stroke-width="10" />
          <path d="m99.17,68.96q13.75,-22.92 27.5,0" fill="none" stroke="black" stroke-linecap="round" stroke-width="10" transform="matrix(1, 0, 0, 1, 0, 0)" />

          <ellipse cx="81.25" cy="106.25" fill="#FFA0AB" rx="30" ry="20" stroke="black" stroke-width="4" />
          <circle cx="71" cy="106" fill="#000000" r="5" />
          <circle cx="91" cy="106" fill="#000000" r="5" />

          <path d="m58.18,121.77c0,-6.8 5.27,10.09 28.19,5.66c22.9,-4.44 29.46,-14 29.73,-6.99c0.26,7.03 -12.2,28.05 -29.46,28.05c-17.27,0 -28.45,-19.92 -28.45,-26.72z" fill="#000000" stroke="#000000" stroke-width="3" />
          <path d="m77.19,140.15c0,-3.08 10.3,-7.4 15.97,-7.4c5.68,0 7.44,0.71 7.44,3.79c0,3.08 -6.91,8.98 -12.59,8.98c-5.68,0 -10.82,-2.29 -10.82,-5.36z" fill="#ff909b" stroke="null" stroke-dasharray="null" stroke-width="null" />
        </svg>
      </div>

      <div style={{ position: 'absolute', right: 0, bottom: 0 }}>
        <span style={{ fontFamily: "sans-serif", fontSize: 14, marginRight: 5, verticalAlign: "-70%" }}>
          v<b>0.13.2</b>
        </span>
        <a style={{ margin: 0, color: "inherit", textDecoration: "none" }} target="_blank" href="https://discord.gg/VfFG9XqDpJ">
          <FaDiscord size={20} style={{ color: "white", verticalAlign: "-80%" }}></FaDiscord>
        </a>
        <a style={{ margin: 0, color: "inherit", textDecoration: "none" }} target="_blank" href="https://github.com/alexanderclarktx/piggo-gg">
          <FaGithub size={20} style={{ color: "white", verticalAlign: "-70%", marginLeft: 5 }}></FaGithub>
        </a>
      </div>

    </div>
  )
}

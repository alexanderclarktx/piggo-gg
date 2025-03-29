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

          <path d="m33.33,68.61q13.33,-22.22 26.67,0" fill="none" stroke="black" strokeLinecap="round" strokeWidth="10" />
          <path d="m99.17,68.96q13.75,-22.92 27.5,0" fill="none" stroke="black" strokeLinecap="round" strokeWidth="10" transform="matrix(1, 0, 0, 1, 0, 0)" />

          <ellipse cx="81.25" cy="106.25" fill="#FFA0AB" rx="30" ry="20" stroke="black" strokeWidth="4" />
          <circle cx="71" cy="106" fill="#000000" r="5" />
          <circle cx="91" cy="106" fill="#000000" r="5" />

          <path d="m107.6,117.17c6.98,-10.28 -4.43,31.08 -21.41,31.08c-17,0 -33.16,-30.69 -24.33,-25.04c8.83,5.64 38.77,4.25 45.74,-6.03z" fill="#000000" stroke="#000000" strokeWidth="3" />
          <path d="m76.82,141.95c0,-2.54 9.32,-6.11 14.45,-6.11c5.14,0 6.73,0.59 6.73,3.13c0,2.54 -6.25,7.42 -11.39,7.42c-5.14,0 -9.79,-1.89 -9.79,-4.43l0,-0.01z" fill="#ff909b" stroke="null" transform="matrix(1, 0, 0, 1, 0, 0)" />
        </svg>
      </div>

      <div style={{ position: 'absolute', right: 0, bottom: 0 }}>
        <span style={{ fontFamily: "sans-serif", fontSize: 14, marginRight: 5, verticalAlign: "-70%" }}>
          v<b>0.13.5</b>
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

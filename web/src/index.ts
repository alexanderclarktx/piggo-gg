import { Lex, LexCanvas, LexDiv } from "@piggo-gg/lex"
import { D3Renderer, DefaultWorld, isMobile, Villagers } from "@piggo-gg/core"

console.log("index.ts", performance.now())

const Title = () => {

  const title = LexDiv({
    style: {
      fontFamily: "Courier New",
      fontSize: "38px",
      fontWeight: "bold",
      position: "relative",
      marginRight: "10px"
    }
  })
  title.e.textContent = "Piggo"

  const svg = LexDiv({
    style: {
      position: "relative",
      top: "3px"
    }
  })

  svg.e.innerHTML = /* svg */ `
    <svg width="35" height="35" viewBox="0 0 160 170" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="90" fill="#FFC0CB" r="79" />

      <path d="m10,53c0,-61.32 10.11,-51.43 50.54,-39.56" fill="#FFC0CB" transform="matrix(1, 0, 0, 1, 0, 0)" />
      <path d="m150,53c0,-61.32 -10.16,-51.43 -50.81,-39.56" fill="#FFC0CB" />

      <path d="m33.33,68.61q13.33,-22.22 26.67,0" fill="none" stroke="black" stroke-linecap="round" stroke-width="10" />
      <path d="m99.17,68.96q13.75,-22.92 27.5,0" fill="none" stroke="black" stroke-linecap="round" stroke-width="10" transform="matrix(1, 0, 0, 1, 0, 0)" />

      <ellipse cx="81.25" cy="106.25" fill="#FFA0AB" rx="30" ry="20" stroke="black" stroke-width="4" />
      <circle cx="71" cy="106" fill="#000000" r="5" />
      <circle cx="91" cy="106" fill="#000000" r="5" />

      <path d="m107.6,117.17c6.98,-10.28 -4.43,31.08 -21.41,31.08c-17,0 -33.16,-30.69 -24.33,-25.04c8.83,5.64 38.77,4.25 45.74,-6.03z" fill="#000000" stroke="#000000" stroke-width="3" />
      <path d="m76.82,141.95c0,-2.54 9.32,-6.11 14.45,-6.11c5.14,0 6.73,0.59 6.73,3.13c0,2.54 -6.25,7.42 -11.39,7.42c-5.14,0 -9.79,-1.89 -9.79,-4.43l0,-0.01z" fill="#ff909b" stroke="null" transform="matrix(1, 0, 0, 1, 0, 0)" />
    </svg>`

  const wrapper = LexDiv({
    style: {
      display: "flex",
      transform: "translate(-50%)",
      left: "50%",
      alignItems: "center"
    },
    children: [title, svg]
  })

  return wrapper
}

const Version = () => {
  const version = LexDiv({
    style: {
      fontSize: "14px",
      marginRight: "5px",
      position: "absolute",
      right: "5px",
      // top: "14.5px",
      top: "28px",
      verticalAlign: "-70%",
      fontWeight: "bold",
      fontFamily: "sans-serif",
    }
  })
  version.e.textContent = 'v0.34.2 D GH'

  return version
}

const Canvas = () => {

  const canvas = LexCanvas({
    style: {
      left: "50%",
      top: "48px",
      transform: "translate(-50%)",
      width: "98%",
      height: "91%"
    }
  })

  if (isMobile()) canvas.e.style.border = "none"

  const three = D3Renderer(canvas.e)
  DefaultWorld({ games: [ Villagers ], three })

  return canvas
}

const App = Lex({
  state: {},
  elements: [Title(), Version(), Canvas()],
  backgroundColor: "#191b1c"
})

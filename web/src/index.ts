import { Lex, LexCanvas, LexDiv } from "@piggo-gg/lex"

const Title = () => {
  const title = LexDiv({
    style: {
      fontFamily: "Courier New",
      fontSize: "38px",
      fontWeight: "bold",
      transform: "translate(-50%)",
      left: "50%",
    }
  })
  title.e.textContent = "Piggo"

  return title
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

  canvas.e.id = "canvas"

  return canvas
}

const App = Lex({
  state: {},
  elements: [Title(), Canvas()],
  backgroundColor: "#191b1c"
})

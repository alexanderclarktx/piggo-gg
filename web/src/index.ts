import { Lex, LexDiv } from "@piggo-gg/lex"
import { Canvas } from "@piggo-gg/web"

const Title = () => {

  const h1 = LexDiv({
    style: {
      fontFamily: "Courier New",
      fontSize: "38px",
      fontWeight: "bold",
      transform: "translate(-50%)",
      left: "50%",
    }
  })
  h1.e.textContent = "Piggo"

  return h1
}

const App = Lex({
  state: {},
  elements: [Title(), Canvas()],
  backgroundColor: "#191b1c"
})

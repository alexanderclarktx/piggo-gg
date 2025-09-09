import { Lex, LexDiv } from "@piggo-gg/lex"
import { Canvas } from "@piggo-gg/web"

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

const App = Lex({
  state: {},
  elements: [Title(), Canvas()],
  backgroundColor: "#191b1c"
})

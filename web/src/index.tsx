import { Root } from "./components/Root"
import { createRoot } from "react-dom/client"

const App = () => (
  <div className="App">
    <Root />
  </div>
)

console.log("MAKING APP")
const domContainer = document.querySelector("#root")
const root = createRoot(domContainer!)
root.render(<App />)

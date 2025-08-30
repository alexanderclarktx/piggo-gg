import { Client, HtmlDiv } from "@piggo-gg/core"

export const HtmlItems = (client: Client) => {

  const div = HtmlDiv({
    width: "400px",
    height: "50px",
    bottom: "50px",
    left: "50%",
    transform: "translate(-50%)"
  })

  return div
}

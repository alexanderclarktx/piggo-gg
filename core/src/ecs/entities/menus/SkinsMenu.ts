import { HtmlDiv, RefreshableDiv } from "@piggo-gg/core"

export const SkinsMenu = (): RefreshableDiv => {
  const skins = HtmlDiv({
    top: "-3px",
    left: "50%",
    width: "100%",
    height: "100%",
    transform: "translate(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    pointerEvents: "auto",
    position: "relative",
    border: "2px solid white"
  })

  return {
    div: skins,
    update: () => { }
  }
}

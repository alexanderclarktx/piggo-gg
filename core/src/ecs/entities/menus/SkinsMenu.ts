import { HtmlDiv, RefreshableDiv } from "@piggo-gg/core"

export const SkinsMenu = (): RefreshableDiv => {
  const skins = HtmlDiv({
    top: "-3px",
    left: "50%",
    width: "100%",
    height: "300px",
    transform: "translate(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    pointerEvents: "auto",
    borderRadius: "10px",
    position: "relative"
  })

  return {
    div: skins,
    update: () => { }
  }
}

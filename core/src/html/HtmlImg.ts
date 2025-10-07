import { CSS } from "@piggo-gg/core"

export type HtmlImg = HTMLImageElement

export const HtmlImg = (src: string, style: CSS): HtmlImg => {
  const img = document.createElement("img")
  img.src = src

  Object.assign(img.style, defaults)
  Object.assign(img.style, style)

  return img
}

const defaults: CSS = {
  position: "absolute",
  pointerEvents: "none",
  borderRadius: "10px",
  transform: "translate(-50%, -50%)"
}

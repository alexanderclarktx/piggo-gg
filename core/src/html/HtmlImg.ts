import { CSS } from "@piggo-gg/core"

export const HtmlImg = (src: string, style: CSS): HTMLImageElement => {
  const img = document.createElement("img")
  img.src = src

  Object.assign(img.style, defaults)
  Object.assign(img.style, style)

  return img
}

const defaults: CSS = {
  position: "absolute",
  pointerEvents: "none"
}

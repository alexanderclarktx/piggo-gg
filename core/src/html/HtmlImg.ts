import { HtmlStyleProps } from "@piggo-gg/core"

export const HtmlImg = (src: string, style: HtmlStyleProps): HTMLImageElement => {
  const img = document.createElement('img')
  img.src = src

  Object.assign(img.style, defaults)
  Object.assign(img.style, style)

  return img
}

const defaults: HtmlStyleProps = {
  position: "absolute",
  pointerEvents: "none"
}

import { HtmlStyleProps } from "@piggo-gg/core"

export const HtmlImg = (style: HtmlStyleProps): HTMLImageElement => {
  const img = document.createElement('img')

  Object.assign(img.style, defaults)
  Object.assign(img.style, style)

  return img
}

const defaults: HtmlStyleProps = {
  position: "absolute",
  pointerEvents: "none"
}

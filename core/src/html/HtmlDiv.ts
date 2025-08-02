import { HtmlStyleProps } from "@piggo-gg/core"

export const HtmlDiv = (style: HtmlStyleProps = {}): HTMLDivElement => {
  const div = document.createElement('div')

  Object.assign(div.style, style)

  return div
}

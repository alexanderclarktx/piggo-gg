import { CSS, HtmlButton, HtmlImg, HtmlText } from "@piggo-gg/core"

type HParams = {
  id?: string
  style?: CSS
  src?: string
  text?: string
  onClick?: () => void
  onHover?: () => void
  onHoverOut?: () => void
}

export const HText = ({ id, style, text }: HParams = {}, child1?: HTMLElement): HTMLDivElement => {
  const d = HtmlText({
    text: text ?? "",
    style: style ?? {}
  })

  if (id) d.id = id
  if (child1) d.appendChild(child1)

  return d
}

export const HButton = ({ id, style, onClick, onHover, onHoverOut }: HParams = {}, child1?: HTMLElement, child2?: HTMLElement): HTMLButtonElement => {
  const b = HtmlButton({
    style: style ?? {},
    onClick: onClick ?? (() => { }),
    onHover: onHover ?? (() => { }),
    onHoverOut: onHoverOut ?? (() => { })
  })

  if (id) b.id = id

  if (child1) b.appendChild(child1)
  if (child2) b.appendChild(child2)

  return b
}

export const HImg = ({ id, style, src }: HParams = {}, child1?: HTMLElement): HTMLImageElement => {
  const i = HtmlImg(src ?? "", style ?? {})

  if (id) i.id = id
  if (child1) i.appendChild(child1)

  return i
}
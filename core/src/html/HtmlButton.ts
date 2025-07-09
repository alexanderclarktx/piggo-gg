export type HtmlButtonProps = {
  text?: string
  style?: {
    position?: "absolute" | "relative" | "fixed" | "sticky" | "static"
    top?: `${number}%`
    left?: `${number}%`
    transform?: string
    padding?: string
    fontSize?: `${number}px`
    backgroundColor?: `#${string}`
    color?: `#${string}`
    border?: string
    borderRadius?: `${number}px`
    cursor?: "pointer" | "default" | "not-allowed"
    zIndex?: number
  }
}

export const HtmlButton = (props: HtmlButtonProps): HTMLButtonElement => {
  const b = document.createElement('button')

  if (props.text) {
    b.textContent = props.text
  }

  Object.assign(b.style, props.style)

  return b
}

export type HtmlTextProps = {
  text?: string,
  style: {
    color?: `#${string}` | `rgba(${number}, ${number}, ${number}, ${number})`
    fontFamily?: "Courier New" | "Arial" | "Verdana",
    fontSize?: `${number}px`,
    fontWeight?: "normal" | "bold" | "bolder" | "lighter",
    left?: `${number}px` | `${number}%`,
    position?: "absolute" | "relative",
    top?: `${number}px` | `${number}%`,
    transform?: `translateX(${number}%)`
  }
}

const defaults: HtmlTextProps["style"] = {
  position: "absolute",
  fontFamily: "Courier New",
  fontWeight: "bold"
}

export const HtmlText = (props: HtmlTextProps): HTMLDivElement => {
  const div = document.createElement('div')

  if (props.text) {
    div.textContent = props.text
  }

  Object.assign(div.style, defaults)

  Object.assign(div.style, props.style)

  return div
}

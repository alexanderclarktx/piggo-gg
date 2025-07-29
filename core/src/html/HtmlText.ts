export type HtmlTextProps = {
  text?: string,
  style: {
    color?: `#${string}` | `rgba(${number}, ${number}, ${number}, ${number})`
    fontFamily?: "Courier New" | "Arial" | "Verdana"
    fontSize?: `${number}px`
    fontWeight?: "normal" | "bold" | "bolder" | "lighter"
    left?: `${number}px` | `${number}%`
    position?: "absolute" | "relative"
    top?: `${number}px` | `${number}%`
    textShadow?: `${number}px ${number}px ${number}px rgba(${number}, ${number}, ${number}, ${number})`
    transform?: `translateX(${number}%)`
    visibility?: "visible" | "hidden"
  }
}

const defaults: HtmlTextProps["style"] = {
  position: "absolute",
  fontFamily: "Courier New",
  fontWeight: "bold",
  textShadow: "2px 2px 2px rgba(0, 0, 0, 0.5)",
}

export const HtmlText = (props: HtmlTextProps): HTMLDivElement => {
  const div = document.createElement('div')

  if (props.text) div.textContent = props.text

  Object.assign(div.style, defaults)
  Object.assign(div.style, props.style)

  return div
}

export const HtmlLabel = (text: string, left: number, top: number, visible: boolean = true) => HtmlText({
  text,
  style: {
    left: `${left}px`,
    top: `${top}px`,
    fontSize: "20px",
    color: "#ffffff",
    transform: "translateX(-50%)",
    visibility: visible ? "visible" : "hidden"
  }
})

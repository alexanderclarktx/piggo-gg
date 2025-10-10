import { Text } from "troika-three-text"

export type ThreeTextProps = {
  text?: string
  fontSize?: number
  font?: string
  color?: number
  outlineWidth?: number
  anchorX?: "center" | "left" | "right"
  anchorY?: "middle" | "top" | "bottom"
}

export const ThreeText = (props: ThreeTextProps = {}) => {
  const text = new Text()

  text.text = props.text || ""
  text.fontSize = props.fontSize || 0.05
  text.font = props.font || "https://fonts.gstatic.com/s/courierprime/v9/u-450q2lgwslOqpF_6gQ8kELWwZjW-_-tvg.ttf"
  text.color = props.color || 0xffffff
  text.outlineWidth = props.outlineWidth || 0.001
  text.anchorX = props.anchorX || "center"
  text.anchorY = props.anchorY || "middle"

  return text
}

import { HtmlDiv } from "./HtmlButton"

export const HtmlMusic = (): HTMLDivElement => {
  const div = HtmlDiv({
    style: {
      right: "50px",
      top: "50px",
      position: "absolute",
      width: "200px",
      height: "160px",
      borderRadius: "5%",
      backgroundColor: "rgba(71, 39, 9, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  })

  return div
}

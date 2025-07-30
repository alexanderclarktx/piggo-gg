import { HtmlDiv } from "./HtmlButton"

export const HtmlMusic = (): HTMLDivElement => {
  const div = HtmlDiv({
    style: {
      left: "80%",
      top: "50px",
      position: "absolute",
      width: "300px",
      height: "300px",
      borderRadius: "5%",
      backgroundColor: "#472709",
      // boxShadow: "0 0 30px rgba(0,0,0,0.4)",
      display: "flex",
      // flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      transform: "translateX(-50%)"
    }
  })
  // const div = document.createElement('div')

  // div.style.left = "50px"
  // div.style.top = "50px"
  // div.style.position = "absolute"

  // div.style.width = "300px"
  // div.style.height = "300px"
  // div.style.borderRadius = "5%"
  // div.style.backgroundColor = "#472709"
  // div.style.boxShadow = "0 0 30px rgba(0,0,0,0.4)"

  return div
}

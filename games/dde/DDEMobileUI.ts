import { HtmlButton, HtmlJoystick, HtmlText, World } from "@piggo-gg/core"

export const DDEMobileUI = (world: World) => {
  if (!world.client?.mobile || !world.three) return

  world.three?.append(
    HtmlJoystick(world.client, "left")
  )

  world.three?.append(
    HtmlJoystick(world.client, "right")
  )

  world.three?.append(HtmlText({
    text: "transform",
    style: { left: "60%", bottom: "24px", fontSize: "14px" }
  }))

  const transformButton = HtmlButton({
    style: {
      bottom: "50px",
      left: "60%",
      transform: "translate(-50%)",
      backgroundColor: "rgba(255, 192, 203, 0.5)",
      width: "50px",
      height: "50px",
      borderRadius: "50%"
    },
    onClick: () => {
      world.actions.push(
        world.tick + 1, world.client?.playerCharacter()?.id ?? "", { actionId: "transform" }
      )
      transformButton.style.backgroundColor = "rgba(255, 192, 203, 0.9)"
    },
    onRelease: () => {
      transformButton.style.backgroundColor = "rgba(255, 192, 203, 0.5)"
    }
  })

  world.three?.append(transformButton)

  world.three?.append(HtmlText({
    text: "jump",
    style: { left: "40%", bottom: "24px", fontSize: "14px" }
  }))

  const jumpButton = HtmlButton({
    style: {
      bottom: "50px",
      left: "40%",
      transform: "translate(-50%)",
      backgroundColor: "rgba(20, 255, 60, 0.5)",
      width: "50px",
      height: "50px",
      borderRadius: "50%"
    },
    onClick: () => {
      world.actions.push(
        world.tick + 1, world.client?.playerCharacter()?.id ?? "", { actionId: "jump" }
      )
      jumpButton.style.backgroundColor = "rgba(20, 255, 60, 0.8)"
    },
    onRelease: () => {
      jumpButton.style.backgroundColor = "rgba(20, 255, 60, 0.5)"
    }
  })

  world.three?.append(jumpButton)
}

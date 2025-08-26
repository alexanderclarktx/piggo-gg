import { HtmlButton, HtmlJoystick, World } from "@piggo-gg/core"

export const DDEMobileUI = (world: World) => {
  if (!world.client?.mobile || !world.three) return

  const menuButton = HtmlButton({
    text: "menu",
    onClick: () => {
      world.three!.mobileLock = !world.three!.mobileLock
    },
    style: {
      top: "2%",
      right: "2%",
      width: "80px"
    }
  })

  world.three.append(menuButton)

  world.three?.append(
    HtmlJoystick(world.client, "left")
  )

  world.three?.append(
    HtmlJoystick(world.client, "right")
  )

  const transformButton = HtmlButton({
    style: {
      bottom: "140px",
      left: "10%",
      transform: "translate(-50%)",
      backgroundColor: "rgba(255, 150, 150, 0.5)",
      width: "50px",
      height: "50px",
      borderRadius: "50%"
    },
    onClick: () => {
      world.actions.push(
        world.tick + 1, world.client?.playerCharacter()?.id ?? "", { actionId: "transform" }
      )
      transformButton.style.backgroundColor = "rgba(255, 150, 150, 0.9)"
    },
    onRelease: () => {
      transformButton.style.backgroundColor = "rgba(255, 150, 150, 0.5)"
    }
  })

  world.three.append(transformButton)

  const jumpButton = HtmlButton({
    style: {
      bottom: "140px",
      right: "10%",
      transform: "translate(50%)",
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

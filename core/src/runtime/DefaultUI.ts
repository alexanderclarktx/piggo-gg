import { Chat, Cursor, Entity, FullscreenButton, isMobile, Joystick, World } from "@piggo-gg/core"

export const DefaultUI = (world: World): Entity[] => {
  if (world.runtimeMode !== "client") return []
  return isMobile() ? DefaultMobileUI() : DefaultDesktopUI()
}

export const DefaultDesktopUI = (): Entity[] => 
  isMobile() ? [] : [ FullscreenButton(), Cursor(), Chat() ]

export const DefaultMobileUI = (): Entity[] =>
  isMobile() ? [ Joystick() ] : []

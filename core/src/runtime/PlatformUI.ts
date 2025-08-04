import { Chat, Cursor, Entity, EscapeMenu, FullscreenButton, isMobile, World } from "@piggo-gg/core"

export const DefaultUI = (world: World): Entity[] => {
  if (world.mode !== "client") return []

  return isMobile() ? DefaultMobileUI() : DefaultDesktopUI()
}

export const DefaultDesktopUI = (): Entity[] => 
  isMobile() ? [] : [ FullscreenButton(), Cursor(), Chat(), EscapeMenu() ]

export const DefaultMobileUI = (): Entity[] =>
  isMobile() ? [] : []

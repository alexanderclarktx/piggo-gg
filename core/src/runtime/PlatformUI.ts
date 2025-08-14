import { Cursor, Entity, EscapeMenu, FullscreenButton, isMobile, PixiChat, World } from "@piggo-gg/core"

export const DefaultUI = (world: World): Entity[] => {
  if (world.mode !== "client") return []

  return isMobile() ? DefaultMobileUI() : DefaultDesktopUI()
}

export const DefaultDesktopUI = (): Entity[] => 
  isMobile() ? [] : [ FullscreenButton(), Cursor(), PixiChat(), EscapeMenu() ]

export const DefaultMobileUI = (): Entity[] =>
  isMobile() ? [] : []

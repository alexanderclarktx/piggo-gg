import { SystemBuilder, isometricToWorld, searchVisibleTiles, tileIndex } from "@piggo-gg/core";
import { Container } from "pixi.js";

export const FogSystem: SystemBuilder<"FogSystem"> = {
  id: "FogSystem",
  init: ({ client, entities, tileMap }) => {

    if (!tileMap) return undefined;

    let last: { tint: number, container: Container }[] = [];

    return {
      id: "FogSystem",
      query: [],
      onTick: () => {
        if (!client) return;

        const floorTilesArray = entities["floorTilesArray"];
        if (!floorTilesArray) return;

        const { playerEntity } = client;
        const skelly = entities[playerEntity.components.controlling.data.entityId];
        if (!skelly) return;

        const { position } = skelly.components;
        if (!position) return;

        const { x, y } = isometricToWorld(position.data)

        const tileX = Math.round(x / 32) - 1;
        const tileY = Math.round(y / 32);

        const index = tileIndex(tileY * 80 + tileX, tileMap);
        const child = floorTilesArray.components.renderable?.c.children[index];
        if (!child) return;

        const visibleTiles: Container[] = [child];

        last.forEach(({ container, tint }) => container.tint = tint);
        last = [];

        visibleTiles.push(...searchVisibleTiles({ x: tileX, y: tileY }, floorTilesArray, tileMap));

        visibleTiles.forEach((tile) => {
          last.push({ container: tile, tint: tile.tint });
        });

        visibleTiles.forEach((tile) => {
          if (tile && tile.tint === 0x7777aa) tile.tint = 0x8888cc;
        });
      }
    }
  }
}

import { Action } from "@piggo-gg/core";

export const Point = Action<{ pointing: number }>(({ params, entity }) => {
  if (!entity) return;

  const { position } = entity.components;
  if (!position) return;

  position.data.pointing = params.pointing;
});

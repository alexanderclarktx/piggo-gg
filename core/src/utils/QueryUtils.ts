import { Entity, Team, World, Position } from "@piggo-gg/core"

export const sameTeam = (entity: Entity<Team>) => (x: Entity<Team>) =>
  x.components.team.data.team === entity.components.team.data.team

export const enemyTeam = (entity: Entity<Team>) => (x: Entity<Team>) =>
  x.components.team.data.team !== entity.components.team.data.team

export const teammates = (world: World, entity: Entity<Team>) => {
  const answer = world.queryEntities<Team | Position>(["team", "position"], sameTeam(entity))
  return answer
}

export const opponents = (world: World, entity: Entity<Team>) =>
  world.queryEntities<Team | Position>(["team", "position"], enemyTeam(entity))

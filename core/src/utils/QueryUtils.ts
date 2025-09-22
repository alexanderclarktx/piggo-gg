import { Entity, Team, World, Position, keys, ValidComponents } from "@piggo-gg/core"

export const filterEntities = (query: ValidComponents[], entities: Entity[]): Entity[] => {
    return entities.filter(e => {
      for (const componentType of query) {
        if (!keys(e.components).includes(componentType)) return false
        if (e.components[componentType]?.active === false) return false
      }
      return true
    })
  }

export const sameTeam = (entity: Entity<Team>) => (x: Entity<Team>) =>
  x.components.team.data.team === entity.components.team.data.team

export const enemyTeam = (entity: Entity<Team>) => (x: Entity<Team>) =>
  x.components.team.data.team !== entity.components.team.data.team

export const teammates = (world: World, entity: Entity<Team>) =>
  world.queryEntities<Team | Position>(["team", "position"], sameTeam(entity))

export const opponents = (world: World, entity: Entity<Team>) =>
  world.queryEntities<Team | Position>(["team", "position"], enemyTeam(entity))

import { World as RapierWorld, RigidBody } from "@dimforge/rapier2d-compat"
import { ClientSystemBuilder, Collider, Entity, Position, abs, entries, keys, sign } from "@piggo-gg/core"

export const LocalPhysicsSystem = ClientSystemBuilder({
  id: "LocalPhysics",
  init: (world) => {

    let bodies: Record<string, RigidBody> = {}
    let colliders: Map<Entity<Collider | Position>, Collider> = new Map()

    const resetPhysics = () => {
      for (const id of keys(bodies)) delete bodies[id]
      colliders.clear()

      const { physics } = world
      if (!physics) return

      physics.free()

      world.physics = new RapierWorld({ x: 0, y: 0 })
      physics.timestep = 0.00625 // 25 / 1000 / 4
    }

    return {
      id: "LocalPhysics",
      query: ["position", "collider"],
      priority: 9,
      onTick: (entities: Entity<Collider | Position>[], isRollback: false) => {

        // wait until rapier is ready
        const { physics } = world
        if (!physics) return

        // reset physics if not rollback
        if (!isRollback) resetPhysics()

        // remove old bodies (TODO does this matter)
        for (const id of keys(bodies)) {
          if (!world.entities[id]) {
            physics.removeRigidBody(bodies[id])
            delete bodies[id]
          }
        }

        const groups: Set<string> = new Set()

        // find dynamic body groups
        for (const entity of entities) {
          const { collider } = entity.components
          if (collider.isStatic === false) {
            groups.add(collider.group)
          }
        }

        // cull static colliders
        entities = entities.filter((entity) => {
          const { collider, renderable } = entity.components
          if (renderable?.visible === false) return false
          return (collider.isStatic === false || !collider.cullable || groups.has(collider.group))
        })

        // sort entities by id
        entities.sort((a, b) => a.id > b.id ? 1 : -1)

        // prepare physics bodies for each entity
        for (const entity of entities) {
          const { position, collider } = entity.components

          // handle new physics bodies
          if (!bodies[entity.id]) {

            // create rapier body/collider
            const body = physics.createRigidBody(collider.bodyDesc)
            try {
              collider.rapierCollider = physics.createCollider(collider.colliderDesc, body)
            } catch (e) {
              console.log("Error creating collider", e)
            }

            // set Collider.body
            collider.body = body

            // store body
            bodies[entity.id] = body

            // store collider
            colliders.set(entity, collider)
          }

          // update body position
          bodies[entity.id].setTranslation({ x: position.data.x, y: position.data.y }, true)

          // update body velocity
          bodies[entity.id].setLinvel({
            x: Math.floor(position.data.velocity.x * 100) / 100,
            y: Math.floor(position.data.velocity.y * 100) / 100
          }, true)
        }

        // run physics
        physics.step()
        physics.step()
        physics.step()
        physics.step()

        // update entity positions
        for (const [id, body] of entries(bodies)) {
          const entity = world.entity<Collider | Position>(id)
          if (!entity) continue

          const { position, collider } = entity.components
          if (collider.isStatic) continue

          const linvel = body.linvel()

          // check if the entity has collided
          const diffX = position.data.velocity.x - Math.floor(linvel.x * 100) / 100
          const diffY = position.data.velocity.y - Math.floor(linvel.y * 100) / 100
          if (position.data.velocityResets && (abs(diffX) > 1 || abs(diffY) > 1)) {
            if (sign(linvel.y) !== sign(position.data.velocity.y) && sign(linvel.x) !== sign(position.data.velocity.x)) {
              position.local.lastCollided = world.tick
              continue
            }
          }

          // update local.velocity
          position.local.velocity.x = Math.floor(linvel.x * 100) / 100
          position.local.velocity.y = Math.floor(linvel.y * 100) / 100
        }
      }
    }
  }
})

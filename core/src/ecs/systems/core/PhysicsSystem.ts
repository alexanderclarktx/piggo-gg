import { init as RapierInit, World as RapierWorld, RigidBody } from "@dimforge/rapier2d-compat"
import { Collider, Entity, Position, SystemBuilder, XYdistance, abs, entries, keys, round } from "@piggo-gg/core"

export let physics: RapierWorld
RapierInit().then(() => physics = new RapierWorld({ x: 0, y: 0 }))

export const PhysicsSystem = SystemBuilder({
  id: "PhysicsSystem",
  init: (world) => {

    let bodies: Record<string, RigidBody> = {}
    let colliders: Map<Entity<Collider | Position>, Collider> = new Map()

    const resetPhysics = () => {
      for (const id of keys(bodies)) delete bodies[id]
      colliders.clear()
      physics.free()

      physics = new RapierWorld({ x: 0, y: 0 })
      physics.timestep = 0.00625 // 25 / 1000 / 4
    }

    return {
      id: "PhysicsSystem",
      query: ["position", "collider"],
      priority: 7,
      onRollback: resetPhysics,
      onTick: (entities: Entity<Collider | Position>[], isRollback: false) => {

        // wait until rapier is ready
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
          // const body = bodies[id]
          const entity = world.entity<Collider | Position>(id)
          if (!entity) continue

          const { position, collider } = entity.components
          if (collider.isStatic) continue

          // check if the entity has collided
          const diffX = position.data.velocity.x - Math.floor(body.linvel().x * 100) / 100
          const diffY = position.data.velocity.y - Math.floor(body.linvel().y * 100) / 100
          if (position.data.velocityResets && (abs(diffX) > 1 || abs(diffY) > 1)) {
            position.lastCollided = world.tick
          }

          // update position/velocity
          position.data.x = round(body.translation().x * 100) / 100
          position.data.y = round(body.translation().y * 100) / 100
          position.data.velocity.x = Math.floor(body.linvel().x * 100) / 100
          position.data.velocity.y = Math.floor(body.linvel().y * 100) / 100
        }

        for (const [entity, collider] of colliders.entries()) {

          // check if standing
          if (entity.components.position.data.friction && collider.rapierCollider && collider.isStatic === false) {
            let standing = false

            physics.contactPairsWith(collider.rapierCollider, (collider2) => {
              const collided = colliders.entries().find(([_, c]) => c.rapierCollider === collider2)
              if (collided && world.entities[collided[0].id]) {
                const { position } = world.entities[collided[0].id].components
                if (position!.data.y > entity.components.position.data.y) {
                  standing = true
                }
              }
            })
            entity.components.position.data.standing = standing
          }

          // sensor callbacks
          if (collider.sensor && collider.rapierCollider) {

            const collidedWith: Entity<Collider | Position>[] = []

            physics.intersectionPairsWith(collider.rapierCollider, (collider2) => {
              const collided = colliders.entries().find(([_, c]) => c.rapierCollider === collider2)
              if (collided && world.entities[collided[0].id]) collidedWith.push(world.entity<Collider | Position>(collided[0].id)!)
            })

            // collide only once
            let collided = false

            collidedWith.sort((a, b) => {
              const aDistance = XYdistance(a.components.position.data, entity.components.position.data)
              const bDistance = XYdistance(b.components.position.data, entity.components.position.data)
              return aDistance > bDistance ? 1 : -1
            }).forEach((entity) => {
              if (!collided) collided = collider.sensor(entity, world)
            })
          }
        }

        // clear heading if arrived
        entities.forEach((entity) => {
          const { position } = entity.components
          if (position.data.heading.x || position.data.heading.y) {
            const dx = position.data.heading.x - position.data.x
            const dy = position.data.heading.y - position.data.y
            if (abs(dx) < 5 && abs(dy) < 5) {
              position.data.heading = { x: NaN, y: NaN }
            }
          }
        })

        // reset velocities
        entities.forEach((entity) => {
          const { position } = entity.components
          if (position.data.velocityResets && !position.data.heading.x && !position.data.heading.y) {
            position.data.velocity.x = 0

            if (world.game.view !== "side") position.data.velocity.y = 0
          }

          position.updateVelocity()
        })
      }
    }
  }
})

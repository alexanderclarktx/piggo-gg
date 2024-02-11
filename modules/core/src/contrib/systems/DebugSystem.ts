import { Collider, DebugBounds, Entity, Position, Renderable, SystemBuilder, TextBox, worldToScreen } from "@piggo-legends/core";
import { Graphics, Text } from 'pixi.js';

// DebugSystem adds visual debug information to renderered entities
export const DebugSystem: SystemBuilder = ({ game }) => {

  let debugRenderables: Renderable[] = [];
  let debugEntitiesPerEntity: Record<string, Entity<Renderable | Position>[]> = {};

  const onTick = (entities: Entity<Position>[]) => {
    if (game.debug) {
      // handle new entities
      entities.forEach((entity) => {
        const { renderable, collider } = entity.components;

        if (!debugEntitiesPerEntity[entity.id] || !debugEntitiesPerEntity[entity.id].length) {
          debugEntitiesPerEntity[entity.id] = [];
          if (renderable) addEntityForRenderable(entity as Entity<Renderable | Position>);
          if (collider) addEntityForCollider(entity as Entity<Collider | Position>);
        }
      });

      Object.entries(debugEntitiesPerEntity).forEach(([id, debugEntities]) => {
        const entity = game.entities[id] as Entity<Position>;
        if (entity) {
          // update debug entity positions
          debugEntities.forEach((debugEntity) => {
            debugEntity.components.position = entity.components.position;
          });
        } else {
          // handle old entities
          debugEntities.forEach((debugEntity) => {
            game.removeEntity(debugEntity.id);
            delete debugEntitiesPerEntity[id];
          });
        }
      });
    } else {
      // remove all debug entities
      Object.values(debugEntitiesPerEntity).forEach((debugEntities) => {
        debugEntities.forEach((debugEntity) => game.removeEntity(debugEntity.id));
      });
      debugEntitiesPerEntity = {};

      // cleanup all debug renderables
      debugRenderables.forEach((renderable) => renderable.cleanup());
      debugRenderables = [];
    }
  }

  const addEntityForRenderable = (entity: Entity<Renderable | Position>) => {
    const {renderable, position} = entity.components;

    // text box
    const textBox = new TextBox({
      dynamic: (c: Text) => {
        if (renderable && position) {
          const bounds = renderable.c.getLocalBounds();
          c.position.set(bounds.x, bounds.top - 25);
          c.text = debugText(position, renderable);
        }
      },
      fontSize: 12, color: 0xffff00
    });

    // debug bounds
    const debugBounds = new DebugBounds({ debugRenderable: renderable });

    const debugEntity = {
      id: `${entity.id}-renderable-debug`,
      components: {
        position: new Position(),
        renderable: new Renderable({
          zIndex: 2,
          children: async () => [textBox, debugBounds]
        })
      }
    };

    debugEntitiesPerEntity[entity.id].push(debugEntity);
    game.addEntity(debugEntity);
    debugRenderables.push(textBox, debugBounds);
  }

  const addEntityForCollider = (entity: Entity<Collider | Position>) => {
    const { collider, position } = entity.components;

    const r = new Renderable({
      dynamic: (c: Graphics) => {
        c.clear().beginFill(0xffffff, 0.1).lineStyle(1, 0xffffff);
        c.drawPolygon(...collider.body.vertices.map((v) => worldToScreen({ x: v.x - position.data.x, y: v.y - position.data.y })));
      },
      zIndex: 5,
      container: async () => new Graphics()
    })

    const debugEntity = {
      id: `${entity.id}-collider-debug`,
      components: {
        position: new Position(),
        renderable: r
      }
    }
    debugEntitiesPerEntity[entity.id].push(debugEntity);
    game.addEntity(debugEntity);
    debugRenderables.push(r);
  }

  const debugText = (p: Position, r: Renderable) => `${p.data.x.toFixed(0)} | ${p.data.y.toFixed(0)}`;

  return {
    componentTypeQuery: ["debug", "position"],
    onTick
  }
}

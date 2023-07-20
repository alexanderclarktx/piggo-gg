import { Entity, EntityProps, Game, GameProps, NetManager, System, SystemProps } from "@piggo-legends/core";
import { Controlled, Player, Position, SerializedPosition } from "@piggo-legends/contrib";

export type TickData = {
  type: "game",
  tick: number,
  player: string,
  entities: Record<string, SerializedEntity>
}

export type SerializedEntity = {
  position?: SerializedPosition
}

export type NetcodeSystemProps = SystemProps & {
  net: NetManager,
  player: string
}

export class NetcodeSystem extends System<NetcodeSystemProps> {
  componentTypeQuery = ["networked"];

  tickDataBuffer: TickData;
  connected = false;

  constructor(props: NetcodeSystemProps) {
    super(props);
    this.init();
  }

  init = () => {
    this.props.net.events.addEventListener("message", (event: CustomEvent<any>) => {
      if (event.detail.type === "game") this.tickDataBuffer = event.detail as TickData;
    });
  }

  onTick = (entities: Entity<EntityProps>[], game: Game<GameProps>) => {
    // handle incoming message
    if (this.tickDataBuffer) {
      if (!this.connected) {
        this.handleInitialConnection(this.tickDataBuffer, game);
      }
      this.handleMessage(this.tickDataBuffer, game);
    }

    this.sendMessage(entities, game);
  }

  handleMessage = (td: TickData, game: Game<GameProps>) => {
    if (td.tick % 1000 === 0) console.log("received", td);

    Object.entries(td.entities).forEach(([id, entity]) => {
      if (game.props.entities[id]) {
        const controlled = game.props.entities[id].components.controlled as Controlled;
        if (controlled && controlled.entityId === this.props.player) return;

        const position = game.props.entities[id].components.position as Position;
        if (position && entity.position) {
          position.deserialize(entity.position)
        }
      }
    });
  }

  handleInitialConnection = (td: TickData, game: Game<GameProps>) => {
    // set connected to true
    this.connected = true;

    game.addEntity(new Entity({
      id: td.player,
      networked: true,
      components: {
        player: new Player({ name: td.player }),
      },
    }));
  }

  sendMessage = (entities: Entity<EntityProps>[], game: Game<GameProps>) => {
    const serializedEntitites: Record<string, SerializedEntity> = {};

    // serialize each entity
    for (const entity of Object.values(entities)) {
      let serialized: SerializedEntity = {};

      const position = entity.components.position as Position;
      if (position) {
        serialized.position = position.serialize();
      }

      serializedEntitites[entity.id] = serialized;
    }

    // construct tick message
    const message: TickData = {
      type: "game",
      tick: game.tick,
      player: this.props.player,
      entities: serializedEntitites
    }

    // send message if connected
    if (this.props.net.pc.connectionState === "connected") {
      this.props.net.sendMessage(message);
      if (game.tick % 1000 === 0) console.log("sent", message);
    }
  }
}

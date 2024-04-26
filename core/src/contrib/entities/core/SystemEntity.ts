import { Data, Entity, Networked, NetworkedEntityData } from "@piggo-gg/core";

export type SystemEntityProps = {
  systemId: string
  data: NetworkedEntityData
}

// a system entity is a special entity that stores networked system data
export const SystemEntity = ({ systemId, data }: SystemEntityProps) => Entity({
  id: `SystemEntity-${systemId}`,
  components: {
    networked: new Networked({ isNetworked: true }),
    data: new Data({ data }),
  }
});

import { Data, Entity, Networked, NetworkedComponentData } from "@piggo-gg/core";

export type SystemEntityProps = {
  systemId: string
  data: NetworkedComponentData
}

// a system entity is a special entity that stores networked system data
export const SystemEntity = ({ systemId, data }: SystemEntityProps) => Entity({
  id: `SystemEntity-${systemId}`,
  components: {
    networked: new Networked({ isNetworked: true }),
    data: new Data({ data }),
  }
});

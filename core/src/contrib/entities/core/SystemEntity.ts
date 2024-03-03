import { Data, Entity, Networked } from "@piggo-gg/core";

export type SystemEntityProps = {
  systemId: string
  data: Record<string, string | number>
}

// a system entity is a special entity that stores networked system data
export const SystemEntity = ({ systemId, data }: SystemEntityProps): Entity => {
  return {
    id: `SystemEntity-${systemId}`,
    components: {
      networked: new Networked({ isNetworked: true }),
      data: new Data({ data }),
    }
  }
}

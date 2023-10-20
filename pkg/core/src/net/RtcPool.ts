import { RtcPeer } from "./RtcPeer";

export class RtcPool {
  connections: Record<string, RtcPeer> = {};
  newConnection: RtcPeer | null = null;
  onLocalUpdated: (offer: string) => void;
  setNetState: (state: string) => void;

  constructor(onLocalUpdated: (offer: string) => void, setNetState: (state: string) => void) {
    this.onLocalUpdated = onLocalUpdated;
    this.setNetState = setNetState;
  }

  addConnection = (name: string, connection: RtcPeer) => {
    this.connections[name] = connection;
  }

  newEmptyConnection = () => {
    return new RtcPeer(
      (local: string) => this.onLocalUpdated(local),
      () => {
        this.setNetState("connected");
        this.addConnection("new", this.newConnection!);
        this.newConnection = null;
      }
    );
  }

  createOffer = async () => {
    if (!this.newConnection) {
      this.newConnection = this.newEmptyConnection();
    }
    await this.newConnection.createOffer();
  }

  acceptOffer = async (offer: string) => {
    if (!this.newConnection) {
      this.newConnection = this.newEmptyConnection();
    }
    await this.newConnection.acceptOffer(offer);
  }

  acceptAnswer = async (answer: string) => {
    if (!this.newConnection) {
      this.newConnection = this.newEmptyConnection();
    }
    await this.newConnection.acceptAnswer(answer);
  }
}

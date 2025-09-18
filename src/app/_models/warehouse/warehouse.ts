import {WhRoom} from "./wh-room";
import {WhSharedElem} from "./shared/wh-shared-elem";

export class Warehouse extends WhSharedElem {
  rooms: WhRoom[];

  constructor(data: Partial<Warehouse>) {
    super(data);
    this.rooms = (data.rooms ?? []).map(r => new WhRoom(r));
  }
}

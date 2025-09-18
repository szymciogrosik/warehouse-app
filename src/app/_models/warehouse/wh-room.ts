import {WhBox} from "./wh-box";
import {WhSharedElem} from "./shared/wh-shared-elem";

export class WhRoom extends WhSharedElem {
  boxes: WhBox[];

  constructor(data: Partial<WhRoom>) {
    super(data);
    this.boxes = (data.boxes ?? []).map(b => new WhBox(b));
  }
}

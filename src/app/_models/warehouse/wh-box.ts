import {WhItem} from "./wh-item";
import {WhSharedElem} from "./shared/wh-shared-elem";

export class WhBox extends WhSharedElem {
  items: WhItem[];

  constructor(data: Partial<WhBox>) {
    super(data);
    this.items = (data.items ?? []).map(i => new WhItem(i));
  }
}

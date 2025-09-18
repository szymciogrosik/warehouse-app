import {WhSharedElem} from "./shared/wh-shared-elem";

export class WhItem extends WhSharedElem {
  updatedTimestamp?: string;

  constructor(data: Partial<WhItem>) {
    super(data);
    this.updatedTimestamp = WhSharedElem.normalizeTimestamp(data.updatedTimestamp);
  }

}

import { DateTime } from "luxon";
import { Timestamp } from "firebase/firestore";

export class WhSharedElem {
  name?: string;
  description?: string;
  createdTimestamp: string;

  constructor(data: Partial<WhSharedElem>) {
    this.name = data.name ?? "";
    this.description = data.description ?? "";
    this.createdTimestamp = WhSharedElem.normalizeTimestamp(data.createdTimestamp);
  }

  public static normalizeTimestamp(raw: any): string {
    if (!raw) return DateTime.now().toISO();
    if (raw instanceof Timestamp) return raw.toDate().toISOString();
    if (typeof raw === "string") return raw;
    return DateTime.now().toISO();
  }
}

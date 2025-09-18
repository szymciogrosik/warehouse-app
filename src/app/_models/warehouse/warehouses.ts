import {Warehouse} from "./warehouse";

export class Warehouses {
  warehouses: Warehouse[];

  constructor(data: Partial<Warehouses>) {
    this.warehouses = (data.warehouses ?? []).map(r => new Warehouse(r));
  }
}

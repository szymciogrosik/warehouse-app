import {EditDialogType} from "./edit-dialog-type";

export interface EditDialogData {
  title: string;
  name: string;
  description: string;
  editType: EditDialogType;
  warehouses?: any[];
  selectedWarehouseIndex: number;
  selectedRoomIndex?: number;
  selectedBoxIndex?: number;
}

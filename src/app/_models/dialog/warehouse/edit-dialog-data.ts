import {EditDialogType} from "./edit-dialog-type";

export interface EditDialogData {
  title: string;
  name: string;
  description: string;
  editType: EditDialogType | null;
  warehouses?: any[];
  selectedWarehouseIndex: number | null;
  selectedRoomIndex?: number | null;
  selectedBoxIndex?: number | null;
}


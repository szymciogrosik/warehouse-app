export interface SmartTableAction<T> {
  labelKey?: string;
  tooltipKey?: string;
  icon?: string;
  color: 'primary' | 'accent' | 'warn' | '';
  onClick: (row: T) => void;
}

export interface SmartTableColumn<T> {
  key: string;
  headerLabelKey: string;
  type: 'text' | 'action' | 'index';
  valueFn?: (row: T) => any;
  actions?: SmartTableAction<T>[];
}

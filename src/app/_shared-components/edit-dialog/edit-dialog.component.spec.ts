import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { EditDialogComponent } from './edit-dialog.component';
import { EditDialogData } from '../../_models/dialog/warehouse/edit-dialog-data';
import { EditDialogType } from '../../_models/dialog/warehouse/edit-dialog-type';

describe('EditDialogComponent', () => {
  let component: EditDialogComponent;
  let fixture: ComponentFixture<EditDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditDialogComponent>>;

  const createComponentWithData = async (data: EditDialogData) => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [EditDialogComponent, NoopAnimationsModule],
      providers: [
        provideTranslateService(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create and initialize form for basic warehouse/room edit (editType = null)', async () => {
    await createComponentWithData({
      title: 'Edit Warehouse',
      name: 'Garage',
      description: 'Tools and bikes',
      editType: null,
      warehouses: [],
      selectedWarehouseIndex: 0,
      selectedRoomIndex: null,
      selectedBoxIndex: null
    });

    expect(component).toBeTruthy();
    expect(component.title).toBe('Edit Warehouse');
    expect(component.form.get('name')?.value).toBe('Garage');
    expect(component.form.get('description')?.value).toBe('Tools and bikes');
    expect(component.form.get('targetRoomIndex')).toBeNull();
    expect(component.form.get('targetBoxIndex')).toBeNull();
  });

  it('should require name field before saving', async () => {
    await createComponentWithData({
      title: 'Add Warehouse',
      name: '',
      description: '',
      editType: null,
      warehouses: [],
      selectedWarehouseIndex: null,
      selectedRoomIndex: null,
      selectedBoxIndex: null
    });

    expect(component.form.valid).toBeFalse();
    component.save();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();

    component.form.patchValue({ name: 'New Warehouse', description: 'Desc' });
    expect(component.form.valid).toBeTrue();
    component.save();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      name: 'New Warehouse',
      description: 'Desc'
    });
  });

  it('should add targetRoomIndex control when editType is BOX', async () => {
    await createComponentWithData({
      title: 'Edit Box',
      name: 'Box A',
      description: 'Cables',
      editType: EditDialogType.BOX,
      warehouses: [],
      selectedWarehouseIndex: 1,
      selectedRoomIndex: 2,
      selectedBoxIndex: 0
    });

    const targetRoomControl = component.form.get('targetRoomIndex');
    expect(targetRoomControl).toBeTruthy();
    expect(targetRoomControl?.value).toEqual({ warehouse: 1, room: 2 });
  });

  it('should add targetBoxIndex control when editType is ITEM', async () => {
    await createComponentWithData({
      title: 'Edit Item',
      name: 'HDMI Cable',
      description: '2m braided',
      editType: EditDialogType.ITEM,
      warehouses: [],
      selectedWarehouseIndex: 0,
      selectedRoomIndex: 1,
      selectedBoxIndex: 3
    });

    const targetBoxControl = component.form.get('targetBoxIndex');
    expect(targetBoxControl).toBeTruthy();
    expect(targetBoxControl?.value).toEqual({ warehouse: 0, room: 1, box: 3 });
  });

  it('should close dialog with null on cancel()', async () => {
    await createComponentWithData({
      title: 'Edit',
      name: 'Test',
      description: '',
      editType: null,
      warehouses: [],
      selectedWarehouseIndex: null,
      selectedRoomIndex: null,
      selectedBoxIndex: null
    });

    component.cancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(null);
  });

  it('should properly compare box and item locations via compareBoxFn and compareItemFn', async () => {
    await createComponentWithData({
      title: 'Edit',
      name: 'Test',
      description: '',
      editType: null,
      warehouses: [],
      selectedWarehouseIndex: null,
      selectedRoomIndex: null,
      selectedBoxIndex: null
    });

    expect(component.compareBoxFn({ warehouse: 0, room: 1 }, { warehouse: 0, room: 1 })).toBeTrue();
    expect(component.compareBoxFn({ warehouse: 0, room: 1 }, { warehouse: 0, room: 2 })).toBeFalse();

    expect(component.compareItemFn({ warehouse: 0, room: 1, box: 2 }, { warehouse: 0, room: 1, box: 2 })).toBeTrue();
    expect(component.compareItemFn({ warehouse: 0, room: 1, box: 2 }, { warehouse: 0, room: 1, box: 3 })).toBeFalse();
  });
});

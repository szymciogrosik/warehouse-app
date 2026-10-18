import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../../_models/dialog/dialog-data';
import { provideZonelessChangeDetection } from '@angular/core';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<DialogComponent>>;

  const mockData: DialogData = {
    title: 'Potwierdzenie',
    message: 'Czy na pewno chcesz usunąć?',
    cancelButtonText: 'Anuluj',
    confirmButtonText: 'Potwierdź',
    popupType: null
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [DialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created and render dialog title and message', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Potwierdzenie');
    expect(fixture.nativeElement.textContent).toContain('Czy na pewno chcesz usunąć?');
  });

  it('should close dialog with false on cancel click', () => {
    (component as any).onCancelClick();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with true on approve click', () => {
    (component as any).onApproveClick();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });
});

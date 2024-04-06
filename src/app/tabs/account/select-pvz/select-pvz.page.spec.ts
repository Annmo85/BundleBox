import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectPVZPage } from './select-pvz.page';

describe('SelectPVZPage', () => {
  let component: SelectPVZPage;
  let fixture: ComponentFixture<SelectPVZPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SelectPVZPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

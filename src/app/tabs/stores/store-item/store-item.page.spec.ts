import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreItemPage } from './store-item.page';

describe('StoreItemPage', () => {
  let component: StoreItemPage;
  let fixture: ComponentFixture<StoreItemPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StoreItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

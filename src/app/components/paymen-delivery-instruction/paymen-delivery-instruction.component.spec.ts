import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PaymenDeliveryInstructionComponent } from './paymen-delivery-instruction.component';

describe('PaymenDeliveryInstructionComponent', () => {
  let component: PaymenDeliveryInstructionComponent;
  let fixture: ComponentFixture<PaymenDeliveryInstructionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymenDeliveryInstructionComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymenDeliveryInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedProfileComponent } from './shared-profile.component';

describe('SharedProfileComponent', () => {
  let component: SharedProfileComponent;
  let fixture: ComponentFixture<SharedProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SharedProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

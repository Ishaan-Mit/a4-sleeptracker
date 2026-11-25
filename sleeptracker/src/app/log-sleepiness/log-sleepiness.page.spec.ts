import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogTirednessPage } from './log-tiredness.page';

describe('LogTirednessPage', () => {
  let component: LogTirednessPage;
  let fixture: ComponentFixture<LogTirednessPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LogTirednessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

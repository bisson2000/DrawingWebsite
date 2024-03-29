import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RectangleSelectionService } from '@app/services/tools/rectangle-selection.service';
import { RectangleSelectionConfigComponent } from './rectangle-selection-config.component';

describe('RectangleSelectionConfigComponent', () => {
    let component: RectangleSelectionConfigComponent;
    let fixture: ComponentFixture<RectangleSelectionConfigComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RectangleSelectionConfigComponent],
            providers: [{ provide: RectangleSelectionService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RectangleSelectionConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

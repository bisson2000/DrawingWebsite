import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatSliderChange, MatSliderModule } from '@angular/material/slider';
import { MatSliderHarness } from '@angular/material/slider/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Stamp } from '@app/classes/tool-config/stamp-config';
import { ToolMath } from '@app/constants/math';
import { StampService } from '@app/services/tools/stamp.service';
import { StampConfigComponent } from './stamp-config.component';

// tslint:disable:no-empty

describe('StampConfigComponent', () => {
    let component: StampConfigComponent;
    let fixture: ComponentFixture<StampConfigComponent>;
    let stampService: StampService;
    let loader: HarnessLoader;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StampConfigComponent],
            imports: [MatDividerModule, MatSliderModule, FormsModule, NoopAnimationsModule, MatSelectModule, MatOptionModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StampConfigComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
        stampService = TestBed.inject(StampService);
        fixture.detectChanges();
        spyOn(stampService, 'isInCanvas').and.returnValue(true);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('wheel event should rotate the stamp', () => {
        const wheelEvent = { deltaY: 1, preventDefault: () => {} } as WheelEvent;
        const currentAngle = (stampService.angleValue = ToolMath.DEGREE_CONVERSION_FACTOR * 2);
        spyOn(stampService, 'drawPreview');
        spyOn(stampService, 'isActive').and.returnValue(true);
        component.wheelEvent(wheelEvent);
        expect(stampService.drawPreview).toHaveBeenCalled();
        expect(currentAngle).not.toEqual(stampService.angleValue);
    });

    it('wheel event should rotate the stamp', () => {
        const wheelEvent = { deltaY: -1, preventDefault: () => {} } as WheelEvent;
        const currentAngle = (stampService.angleValue = 0);
        spyOn(stampService, 'drawPreview');
        spyOn(stampService, 'isActive').and.returnValue(true);
        component.wheelEvent(wheelEvent);
        expect(stampService.drawPreview).toHaveBeenCalled();
        expect(currentAngle).not.toEqual(stampService.angleValue);
    });

    it('wheel event should not rotate the stamp if not active', () => {
        const wheelEvent = { deltaY: 1, preventDefault: () => {} } as WheelEvent;
        spyOn(stampService, 'drawPreview');
        spyOn(stampService, 'isActive').and.returnValue(false);
        component.wheelEvent(wheelEvent);
        expect(stampService.drawPreview).not.toHaveBeenCalled();
    });

    it('toggleStamp should update the stamp', () => {
        const currentStamp = stampService.config.stamp;
        component.toggleStamp(Stamp.Felix);
        expect(currentStamp).not.toEqual(stampService.config.stamp);
    });

    it('should load all slider harnesses', async () => {
        const sliders = await loader.getAllHarnesses(MatSliderHarness);
        expect(sliders.length).toBe(1);
    });

    it('should get max value of slider', async () => {
        const slider = await loader.getHarness(MatSliderHarness);
        expect(await slider.getMaxValue()).toBe(component.MAX_SCALE);
    });

    it('should be able to set value of slider', async () => {
        const setValue = 2.5;
        const slider = await loader.getHarness(MatSliderHarness);
        expect(await slider.getValue()).toBe(1);

        await slider.setValue(setValue);

        expect(await slider.getValue()).toBe(setValue);
    });

    it('should load all button toggle group harnesses', async () => {
        const buttons = await loader.getAllHarnesses(MatSelectHarness);
        expect(buttons.length).toBe(1);
    });

    it('should load the toggles inside the group', async () => {
        const nOptions = 5;
        const group = await loader.getHarness(MatSelectHarness);
        await group.open();
        const options = await group.getOptions();
        expect(options.length).toBe(nOptions);
    });

    it('should update angle by 15 degree if alt is not pressed', () => {
        stampService.angleValue = 0;
        spyOn(stampService, 'isActive').and.returnValue(true);
        spyOn(stampService, 'drawPreview');
        const wheelEvent = { deltaY: 1, preventDefault: () => {} } as WheelEvent;
        component.wheelEvent(wheelEvent);
        expect(stampService.angleValue).toEqual(component.ROTATION);
    });

    it('should update angle by 1 degree if alt is pressed', () => {
        stampService.angleValue = 0;
        stampService.ALT_KEY.isDown = true;
        spyOn(stampService, 'isActive').and.returnValue(true);
        spyOn(stampService, 'drawPreview');
        const wheelEvent = { deltaY: 1, preventDefault: () => {} } as WheelEvent;
        component.wheelEvent(wheelEvent);
        expect(stampService.angleValue).toEqual(1);
    });

    it('should change config value on slider change', () => {
        component.changeStampScale({ value: 2 } as MatSliderChange);
        expect(component.stampService.config.scale).toBe(2);
    });
});

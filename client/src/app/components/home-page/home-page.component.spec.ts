import { HttpClientModule } from '@angular/common/http';
import { NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CarrouselComponent } from '@app/components/carrousel/carrousel.component';
import { EditorComponent } from '@app/components/editor/editor.component';
import { HomePageComponent } from '@app/components/home-page/home-page.component';
import { DrawingService } from '@app/services/drawing/drawing.service';

describe('HomePageComponent', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;
    let drawingService: DrawingService;
    let zone: NgZone;
    let router: Router;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HomePageComponent, EditorComponent, CarrouselComponent],
            imports: [
                RouterTestingModule.withRoutes([
                    { path: 'home', component: HomePageComponent },
                    { path: 'editor', component: EditorComponent },
                    { path: 'carrousel', component: CarrouselComponent },
                ]),
                HttpClientModule,
                NoopAnimationsModule,
                MatButtonModule,
                MatExpansionModule,
                MatIconModule,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        zone = TestBed.inject(NgZone);
        drawingService = TestBed.inject(DrawingService);
        zone.run(() => {
            router.initialNavigation();
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fade out', () => {
        component.fadeOut();
        expect(component.state).toBe('invisible');
    });

    it('should fade in', () => {
        component.fadeIn();
        expect(component.state).toBe('visible');
    });

    it('should be visible after fade in', () => {
        component.fadeIn();
        component.endOfFadeAnimation();
        expect(component.showComponent).toBeTrue();
    });

    it('should be invisible after fade out', () => {
        component.fadeOut();
        component.endOfFadeAnimation();
        expect(component.showComponent).toBeFalse();
    });

    it('should close the new drawing warning', () => {
        component.showNewDrawingWarning = true;
        component.closeNewDrawingWarning();
        expect(component.showNewDrawingWarning).toBeFalse();
    });

    it('should create a new drawing if there are no saved drawings', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 1, 1);

        // tslint:disable-next-line:no-string-literal
        const getSavedDrawingSpy = spyOn(component['drawingService'], 'getSavedDrawing').and.returnValue(canvas.toDataURL());
        const createNewDrawingSpy = spyOn(component, 'createNewDrawing');

        await component.createNewDrawingOption();
        expect(createNewDrawingSpy).toHaveBeenCalled();

        createNewDrawingSpy.calls.reset();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 1, 1);
        getSavedDrawingSpy.and.returnValue(canvas.toDataURL());
        await component.createNewDrawingOption();
        expect(createNewDrawingSpy).not.toHaveBeenCalled();

        getSavedDrawingSpy.and.returnValue(null);
        await component.createNewDrawingOption();
        expect(createNewDrawingSpy).toHaveBeenCalled();
    });

    it('should create new drawing', () => {
        component.createNewDrawing();
        expect(component.state).toBe('invisible');
    });

    it('should open the carrousel', () => {
        component.openCarrousel();
        expect(component.state).toBe('invisible');
    });

    it('should go back to menu', () => {
        component.createNewDrawing();
        expect(component.state).toBe('invisible');
        component.backToMenu();
        expect(component.state).toBe('visible');
    });

    it('should call fadeOut and createLoadedCanvasFromStorage when continue drawing button is clicked', () => {
        spyOn(component, 'fadeOut');
        spyOn(drawingService, 'createLoadedCanvasFromStorage');
        component.continueDrawing();
        expect(component.fadeOut).toHaveBeenCalled();
        expect(drawingService.createLoadedCanvasFromStorage).toHaveBeenCalled();
    });

    it('should show continue drawing button when drawingService provided a non null drawing from local storage', () => {
        drawingService.getSavedDrawing = jasmine.createSpy().and.returnValue('test_drawing');
        component.init();
        expect(component.showContinueDrawing).toBeTruthy();
    });

    it('should open the carrousel with the right shortcut', () => {
        const openCarrouselSpy = spyOn(component, 'openCarrousel');
        let keyboardEvent = new KeyboardEvent('keydown', { key: 'a', ctrlKey: false });
        component.onKeyDown(keyboardEvent);
        expect(openCarrouselSpy).not.toHaveBeenCalled();
        keyboardEvent = new KeyboardEvent('keydown', { key: 'g', ctrlKey: true });
        component.onKeyDown(keyboardEvent);
        expect(openCarrouselSpy).toHaveBeenCalled();
    });
});

import { Injectable } from '@angular/core';
import { AbstractDraw } from '@app/classes/commands/abstract-draw';
import { ResizeDraw } from '@app/classes/commands/resize-draw';
import { ShortcutKey } from '@app/classes/shortcut/shortcut-key';
import { SpecialKeys } from '@app/classes/shortcut/special-keys';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    readonly BLOCK_UNDO_ICON: Subject<boolean> = new Subject<boolean>();
    readonly BLOCK_REDO_ICON: Subject<boolean> = new Subject<boolean>();

    context: CanvasRenderingContext2D;
    preview: CanvasRenderingContext2D;
    readonly UNDO_SHORTCUT: ShortcutKey;
    readonly REDO_SHORTCUT: ShortcutKey;
    originalResize: ResizeDraw;

    originalCanvas: HTMLCanvasElement;

    commands: AbstractDraw[];
    currentAction: number;
    private readonly INITIAL_ACTION_POSITION: number = -1;
    private blockUndoRedoIn: boolean;

    constructor() {
        this.REDO_SHORTCUT = new ShortcutKey('z', { ctrlKey: true, shiftKey: true } as SpecialKeys);
        this.UNDO_SHORTCUT = new ShortcutKey('z', { ctrlKey: true } as SpecialKeys);
        this.reset();
    }

    get blockUndoRedo(): boolean {
        return this.blockUndoRedoIn;
    }

    set blockUndoRedo(block: boolean) {
        this.blockUndoRedoIn = block;
        this.sendIconSignals(block);
    }

    init(context: CanvasRenderingContext2D, preview: CanvasRenderingContext2D, originalResize: ResizeDraw): void {
        this.reset();

        this.originalResize = originalResize;
        this.preview = preview;
        this.context = context;

        this.originalCanvas = document.createElement('canvas');
        this.originalCanvas.height = this.context.canvas.height;
        this.originalCanvas.width = this.context.canvas.width;

        const tempCtx = this.originalCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempCtx.drawImage(this.context.canvas, 0, 0);
    }

    saveCommand(command: AbstractDraw): void {
        this.commands.splice(this.currentAction + 1);

        this.commands.push(command);
        this.currentAction += 1;
        this.sendIconSignals(this.blockUndoRedo);
    }

    undo(): void {
        if (this.blockUndoRedo) return;
        if (this.currentAction < 0) return;

        this.currentAction -= 1;

        this.originalResize.execute();
        this.context.drawImage(this.originalCanvas, 0, 0);

        for (let i = 0; i <= this.currentAction; i++) {
            this.commands[i].execute(this.context);
        }

        this.sendIconSignals(this.blockUndoRedo);
        this.autoSave();
    }

    redo(): void {
        if (this.blockUndoRedo) return;
        if (this.currentAction >= this.commands.length - 1) return;

        this.currentAction += 1;

        this.commands[this.currentAction].execute(this.context);
        this.sendIconSignals(false);
        this.autoSave();
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.REDO_SHORTCUT.equals(event)) this.redo();
        else if (this.UNDO_SHORTCUT.equals(event)) this.undo();
    }

    reset(): void {
        this.blockUndoRedo = true;
        this.commands = [];
        this.currentAction = this.INITIAL_ACTION_POSITION;
    }

    private autoSave(): void {
        localStorage.setItem('drawing', this.context.canvas.toDataURL());
    }

    private sendIconSignals(block: boolean): void {
        this.BLOCK_UNDO_ICON.next(block || this.currentAction < 0);
        this.BLOCK_REDO_ICON.next(block || this.currentAction >= this.commands.length - 1);
    }
}

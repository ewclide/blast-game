import { Container, Graphics, Point } from 'pixi.js';
import { Box } from '@blast-game/core';
import { TileEntity } from './tile';

export interface GridOptions {
    cols: number;
    rows: number;
    width: number;
    height: number;
    topPadding: number;
}

export interface CellAttachment {
    cell: Cell | null;
    attach(cell: Cell): void;
    detach(): void;
    getNeighbors(): CellAttachment[];
}

export interface Cell {
    box: Box;
    position: Point;
    row: number;
    col: number;
    attachment: CellAttachment | null;
    neighbors: Cell[];
}

export class Grid {
    private _cells: Cell[][] = [];
    private _cellSize = new Point();

    readonly cols: number;
    readonly rows: number;
    readonly width: number;
    readonly height: number;
    readonly container: Container;
    readonly topPadding: number;

    get cellWidth(): number {
        return this._cellSize.x;
    }

    get cellHeight(): number {
        return this._cellSize.y;
    }

    onClick: (cell: Cell) => void = () => {};

    constructor(options: GridOptions) {
        const { width, height, cols, rows, topPadding } = options;

        const container = new Container();
        container.interactive = true;
        container.cursor = 'pointer';
        container.onclick = (event) => {
            const cell = this.getCellByCoords(event.x, event.y);
            if (cell) {
                this.onClick(cell);
            }
        };

        // Clip grid field to hide tiles on top
        const clipMask = new Graphics();
        clipMask.rect(0, -topPadding, width, height + topPadding);
        clipMask.fill(0xffffff);
        clipMask.renderable = true;
        container.addChild(clipMask);
        container.mask = clipMask;

        this.topPadding = topPadding;
        this.container = container;
        this.width = width;
        this.height = height;
        this.cols = cols;
        this.rows = rows;

        this.create();
    }

    create() {
        const { rows, cols } = this;

        const cellWidth = this.width / cols;
        const cellHeight = this.height / rows;
        this._cellSize.set(cellWidth, cellHeight);

        // Create grid: by columns
        this._cells = Array.from({ length: cols }, (_, col) => {
            return Array.from({ length: rows }, (_, row) => {
                const box = new Box();
                const position = new Point(col * cellWidth, row * cellHeight);

                box.setPositionSize(
                    position.x,
                    position.y,
                    cellWidth,
                    cellHeight
                );

                return {
                    box,
                    position,
                    col,
                    row,
                    attachment: null,
                    neighbors: [],
                };
            });
        });

        // setup neighbors
        this.forEachCell((cell) => {
            const { row, col } = cell;
            cell.neighbors = [
                this.getCellByRowCol(row - 1, col),
                this.getCellByRowCol(row + 1, col),
                this.getCellByRowCol(row, col - 1),
                this.getCellByRowCol(row, col + 1),
                // this.getCellByRowCol(row - 1, col - 1),
                // this.getCellByRowCol(row - 1, col + 1),
                // this.getCellByRowCol(row + 1, col - 1),
                // this.getCellByRowCol(row + 1, col + 1),
            ].filter((c) => c !== null) as Cell[];
        });
    }

    forEachCell(traverser: (cell: Cell) => void) {
        for (const verticalLine of this._cells) {
            for (const cell of verticalLine) {
                traverser(cell);
            }
        }
    }

    forEachColumn(traverser: (column: Cell[], index: number) => void): void {
        for (let col = 0; col < this._cells.length; col++) {
            const column = this._cells[col];
            traverser(column, col);
        }
    }

    clear() {
        for (const verticalLine of this._cells) {
            for (const cell of verticalLine) {
                cell.attachment = null;
            }
        }
    }

    getAllAttachments(): CellAttachment[] {
        const attachments: CellAttachment[] = [];

        this.forEachCell((cell) => {
            const { attachment } = cell;
            if (attachment) {
                attachments.push(attachment);
            }
        });

        return attachments;
    }

    getCellByRowCol(row: number, col: number): Cell | null {
        const column = this._cells[col];
        if (column === undefined) {
            return null;
        }

        return column[row] || null;
    }

    getCellByCoords(x: number, y: number): Cell | null {
        const { x: padX, y: padY } = this.container.position;
        const col = Math.floor((x - padX) / this._cellSize.x);
        const row = Math.floor((y - padY) / this._cellSize.y);

        const verticalLine = this._cells[col];
        if (verticalLine === undefined) {
            return null;
        }

        return verticalLine[row] || null;
    }
}

import { Container, Graphics, Point, Texture } from 'pixi.js';
import { Tile, TileType } from './tile';
import { Box } from '@blast-game/core';

export interface GridOptions {
    cols: number;
    rows: number;
    width: number;
    height: number;
    topPadding: number;
}

export interface Cell {
    box: Box;
    position: Point;
    row: number;
    col: number;
    tile: Tile | null;
    /*
        Note: Store as mask
        mask = 0x[row][col] = (row << 16 | col)
        row = mask >> 16;
        col = mask & 0xffff;
    */
    neighbors: number[];
}

export interface TileTypeDescriptor {
    type: TileType;
    texture: Texture;
}

const encodeCoords = (row: number, col: number) => (row << 16) | col;
const decodeCoords = (mask: number) => [mask >> 16, mask & 0xffff];

export class Grid {
    private _cells: Cell[][] = [];
    private _cellSize = new Point();

    readonly cols: number;
    readonly rows: number;
    readonly width: number;
    readonly height: number;
    readonly container: Container;

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

        const encodeWithBorderCheck = (row: number, col: number) => {
            // Check field restrictions additionally
            return col >= 0 && col < cols && row >= 0 && row < rows
                ? encodeCoords(row, col)
                : -1;
        };

        // Create grid: by columns
        this._cells = Array.from({ length: cols }, (_, col) => {
            return Array.from({ length: rows }, (_, row) => {
                const box = new Box();
                const position = new Point(col * cellWidth, row * cellHeight);
                const neighbors = [
                    encodeWithBorderCheck(row - 1, col),
                    encodeWithBorderCheck(row + 1, col),
                    encodeWithBorderCheck(row, col - 1),
                    encodeWithBorderCheck(row, col + 1),
                    encodeWithBorderCheck(row - 1, col - 1),
                    encodeWithBorderCheck(row - 1, col + 1),
                    encodeWithBorderCheck(row + 1, col - 1),
                    encodeWithBorderCheck(row + 1, col + 1),
                ].filter((v) => v >= 0);

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
                    tile: null,
                    neighbors,
                };
            });
        });
    }

    forEachCell(traverser: (cell: Cell) => void) {
        for (const verticalLine of this._cells) {
            for (const cell of verticalLine) {
                traverser(cell);
            }
        }
    }

    forEachColumn(traverser: (column: Cell[], index: number) => void) {
        const cells = this._cells;
        for (let col = 0; col < cells.length; col++) {
            const column = cells[col];
            traverser(column, col);
        }
    }

    clear() {
        for (const verticalLine of this._cells) {
            for (const cell of verticalLine) {
                cell.tile = null;
            }
        }
    }

    getCol(col: number): Cell[] {
        return this._cells[col];
    }

    getCellByMask(mask: number): Cell {
        const [row, col] = decodeCoords(mask);
        return this.getCellByRowCol(row, col);
    }

    getCellByRowCol(row: number, col: number): Cell {
        return this._cells[col][row];
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

import { Circle, Container, Graphics, Point, Texture } from 'pixi.js';
import { InternalAssets, TileType } from './game';
import { clamp, randi } from './utils';
import { TimeSystem } from './time';
import { ClickData } from './input';
import { Tile } from './tile';

export interface FieldOptions {
    width: number;
    height: number;
    padding: number;
    sizeX: number;
    sizeY: number;
    minBatchSize: number;
}

interface Cell {
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

interface TileTypeDescriptor {
    type: TileType;
    texture: Texture;
}

const TILE_ACCEL = 3000;
const encodeCoords = (row: number, col: number) => (row << 16) | col;
const decodeCoords = (mask: number) => [mask >> 16, mask & 0xffff];

export class Box {
    readonly min: Point = new Point();
    readonly max: Point = new Point();

    get extents(): number[] {
        const { min, max } = this;
        const w = Math.abs(max.x - min.x) / 2;
        const h = Math.abs(max.y - min.y) / 2;

        return [min.x + w, min.y + h, w, h];
    }

    containPoint(point: Point): boolean {
        const { min, max } = this;
        const { x, y } = point;
        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
    }

    setPositionSize(x: number, y: number, width: number, height: number) {
        this.min.x = x;
        this.min.y = y;
        this.max.x = x + width;
        this.max.y = y + height;
    }
}

function vectorLength(vector: Point): number {
    const { x, y } = vector;
    return Math.sqrt(x * x + y * y);
}

function testCircleBox(circle: Circle, aabb: Box): boolean {
    const center = new Point(circle.x, circle.y);
    const [bx, by, boxHalfWidth, boxHalfHeight] = aabb.extents;
    const difference = new Point(center.x - bx, center.y - by);
    const clamped = new Point(
        clamp(difference.x, -boxHalfWidth, boxHalfWidth),
        clamp(difference.y, -boxHalfHeight, boxHalfHeight)
    );
    const closest = new Point(bx + clamped.x, by + clamped.y);

    difference.x = closest.x - center.x;
    difference.y = closest.y - center.y;

    return vectorLength(difference) < circle.radius;
}

export class Field {
    private _tiles = new Map<number, Tile>();
    private _grid: Cell[][] = [];
    private _cellSize = new Point();
    private _blockTapping: boolean = false;
    private _tileTypes: TileTypeDescriptor[] = [];
    private _tilesToFall = new Set<{
        tile: Tile;
        dst: Cell;
        delay: number;
    }>();

    readonly fieldWidth: number;
    readonly fieldHeight: number;
    readonly padding: number;
    readonly sizeX: number;
    readonly sizeY: number;
    readonly minBatchSize: number;
    readonly container: Container;

    constructor(options: FieldOptions) {
        this.container = new Container();
        this.fieldWidth = options.width;
        this.fieldHeight = options.height;
        this.padding = options.padding;
        this.sizeX = options.sizeX;
        this.sizeY = options.sizeY;
        this.minBatchSize = options.minBatchSize;
    }

    create(assets: InternalAssets) {
        const { sizeY, sizeX, padding } = this;
        const cellWidth = this.fieldWidth / sizeX;
        const cellHeight = this.fieldHeight / sizeY;
        this._cellSize.set(cellWidth, cellHeight);
        // TODO: think about padding
        this.container.position.x += padding;
        this.container.position.y += padding;

        const clipMask = new Graphics();
        const topPadding = 10;
        clipMask.rect(
            0,
            -topPadding,
            this.fieldWidth,
            this.fieldHeight + topPadding
        );
        clipMask.fill(0xffffff);
        clipMask.renderable = true;
        this.container.addChild(clipMask);
        this.container.mask = clipMask;

        // Prepare tile descriptors
        this._tileTypes = [...assets.tileTypes].map(([type, texture]) => ({
            type,
            texture,
        }));

        const encodeWithBorderCheck = (row: number, col: number) => {
            // Check field restrictions additionally
            return col >= 0 && col < sizeX && row >= 0 && row < sizeY
                ? encodeCoords(row, col)
                : -1;
        };

        // Create grid: by columns
        this._grid = Array.from({ length: sizeX }, (_, col) => {
            return Array.from({ length: sizeY }, (_, row) => {
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

        // Fill grid by tiles
        for (const verticalLine of this._grid) {
            for (const cell of verticalLine) {
                const tile = this.generateTile();
                // TODO: replace this by accessors
                tile.container.position.copyFrom(cell.position);
                tile.container.zIndex = verticalLine.length - cell.row;
                cell.tile = tile;
            }
        }
    }

    generateTile(): Tile {
        const { x: cellWidth, y: cellHeight } = this._cellSize;
        const tileTypes = this._tileTypes;
        const randomTile = tileTypes[randi(0, tileTypes.length - 1)];
        const tile = new Tile({
            type: randomTile.type,
            position: new Point(),
            width: cellWidth,
            height: cellHeight,
            texture: randomTile.texture,
            zIndex: 0,
        });

        this._tiles.set(tile.id, tile);
        this.container.addChild(tile.container);
        return tile;
    }

    shuffle() {
        for (const verticalLine of this._grid) {
            for (const cell of verticalLine) {
                cell.tile = null;
            }
        }

        const tiles = [...this._tiles.values()];

        let currentIndex = tiles.length - 1;
        while (currentIndex >= 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            const randomTile = tiles[randomIndex];
            const currentTile = tiles[currentIndex];

            tiles[currentIndex] = randomTile;
            tiles[randomIndex] = currentTile;

            currentIndex--;
        }

        tiles.forEach((tile, index) => {
            const col = index % this.sizeX;
            const row = Math.floor(index / this.sizeX);
            const cell = this._grid[col][row];

            tile.container.position.copyFrom(cell.position);
            tile.container.zIndex = this.sizeY - row;
            cell.tile = tile;
        });
    }

    update(time: TimeSystem) {
        const dt = time.delta;

        for (const tileData of this._tilesToFall) {
            const { tile, dst, delay } = tileData;
            if (delay > 0) {
                tileData.delay -= dt;
                continue;
            }

            const maxY = dst.position.y;
            const position = tile.container.position;

            tile.speed += TILE_ACCEL * dt;
            position.y += tile.speed * dt;
            if (position.y >= maxY) {
                dst.tile = tile;
                position.y = maxY;
                tile.speed = 0;
                this._tilesToFall.delete(tileData);
            }
        }

        if (!this._tilesToFall.size) {
            this._blockTapping = false;
        }
    }

    click(data: ClickData) {
        if (this._blockTapping) {
            return;
        }

        const { x, y } = data.relative;
        const cell = this._getCellByCoords(x, y);

        if (cell === null) {
            return;
        }

        // Destroy the batch of tiles
        // const cells = this.getCellsBatch(cell);
        const cells = this.blowUpTiles(cell, 220);
        if (cells.size >= this.minBatchSize) {
            this._blockTapping = true;
            for (const cell of cells) {
                if (cell.tile !== null) {
                    this.destroyTile(cell.tile);
                }
                cell.tile = null;
            }
        }

        // Check tiles to fall
        for (let col = 0; col < this._grid.length; col++) {
            const verticalLine = this._grid[col];

            let emptyCells = 0;
            for (let ci = verticalLine.length - 1; ci >= 0; ci--) {
                const cell = verticalLine[ci];
                const { tile } = cell;

                if (tile === null) {
                    emptyCells++;
                }

                if (tile !== null && emptyCells > 0) {
                    // Now the tile is not attached to the cell, because it's falling
                    cell.tile = null;
                    const dst = verticalLine[ci + emptyCells];
                    tile.container.zIndex = verticalLine.length - dst.row;
                    this._tilesToFall.add({
                        tile,
                        dst,
                        delay: 1,
                    });
                }
            }

            // Generate tiles on the top of grid to fill it
            for (let ci = 0; ci < emptyCells; ci++) {
                const tile = this.generateTile();
                const dst = verticalLine[emptyCells - (ci + 1)];
                const cX = col * this._cellSize.x;
                const cY = -(ci + 1) * this._cellSize.y - tile.topPadding;

                tile.container.position.set(cX, cY);
                tile.container.zIndex = verticalLine.length - dst.row;

                this._tilesToFall.add({
                    tile,
                    dst,
                    delay: 1,
                });
            }
        }
    }

    getCellsBatch(cell: Cell, _cells: Set<Cell> = new Set()): Set<Cell> {
        const { tile } = cell;
        if (tile === null || _cells.has(cell)) {
            return _cells;
        }

        _cells.add(cell);

        // Skip diagonal neighbors (last 4)
        for (let ni = 0; ni < 4; ni++) {
            const coords = cell.neighbors[ni];
            const [row, col] = decodeCoords(coords);
            const neighborCell = this._getCellByRowCol(row, col);
            const neighborTile = neighborCell.tile;

            if (neighborTile !== null && neighborTile.type === tile.type) {
                this.getCellsBatch(neighborCell, _cells);
            }
        }

        return _cells;
    }

    blowUpTiles(
        cell: Cell,
        radius: number,
        _circle?: Circle,
        _cells = new Set<Cell>()
    ): Set<Cell> {
        const { tile } = cell;
        if (tile === null || _cells.has(cell)) {
            return _cells;
        }

        let circle = _circle;
        if (circle === undefined) {
            circle = new Circle(
                cell.position.x + this._cellSize.x / 2,
                cell.position.y + this._cellSize.y / 2,
                radius
            );

            const grap = new Graphics();
            grap.circle(circle.x, circle.y, circle.radius);
            grap.stroke({ width: 2, color: 0xff00ff });
            grap.zIndex = 1000;
            this.container.addChild(grap);
        }

        // TODO: get from cell
        if (testCircleBox(circle, cell.box)) {
            _cells.add(cell);

            for (const coords of cell.neighbors) {
                const [row, col] = decodeCoords(coords);
                const neighborCell = this._getCellByRowCol(row, col);
                this.blowUpTiles(neighborCell, radius, circle, _cells);
            }
        }

        return _cells;
    }

    destroyTile(tile: Tile) {
        this._tiles.delete(tile.id);
        this.container.removeChild(tile.container);
    }

    private _getCellByRowCol(row: number, col: number): Cell {
        return this._grid[col][row];
    }

    private _getCellByCoords(x: number, y: number): Cell | null {
        const pad = this.padding;
        const col = Math.floor((x - pad) / this._cellSize.x);
        const row = Math.floor((y - pad) / this._cellSize.y);

        const verticalLine = this._grid[col];
        if (verticalLine === undefined) {
            return null;
        }

        return verticalLine[row] || null;
    }
}

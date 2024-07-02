import { Easing, Tween } from '@tweenjs/tween.js';
import { Context, BaseScene } from '@blast-game/framework';
import { randi, testCircleBox } from '@blast-game/core';
import { Circle, Point, Texture } from 'pixi.js';
import { MainState, MainStore } from './store';
import { Tile, TileType } from './tile';
import { Cell, Grid } from './grid';
import { MainUI } from './ui';

export interface TileTypeDescriptor {
    type: TileType;
    texture: Texture;
}

const TILE_ACCEL = 3000;

export class MainScene extends BaseScene<MainState> {
    private _grid!: Grid;
    private _tiles = new Map<number, Tile>();
    private _tileTypes: TileTypeDescriptor[] = [];
    private _stopClicking: boolean = false;
    private _tweens: Map<Tile, Tween<any>> = new Map();
    private _minBatchSize: number = 2;
    private _tilesToFall = new Set<{
        tile: Tile;
        dst: Cell;
        delay: number;
    }>();

    constructor(name: string, ui: MainUI, store: MainStore) {
        super(name, ui, store);

        this.container.addChild(this.ui.container);

        this._grid = new Grid({
            cols: 10,
            rows: 10,
            width: 550,
            height: 550,
            topPadding: 7,
        });

        this._grid.onClick = this.onClickGrid;
    }

    async init() {
        await super.init();

        // TODO
        const { resources } = Context.get();

        const tileTypes = {
            red: 'tile-red',
            green: 'tile-green',
            blue: 'tile-blue',
            pink: 'tile-pink',
            yellow: 'tile-yellow',
        };

        const tiles: TileTypeDescriptor[] = [];
        for (const [type, image] of Object.entries(tileTypes)) {
            const texture = resources.get(Texture, image);
            tiles.push({ type, texture });
        }

        this._tileTypes = tiles;

        this.fillGrid();

        this.ui.layout.attach('grid', this._grid.container);

        this.store.setState({
            scores: 0,
            steps: 50,
            maxScores: 100,
        });

        this.store.subscribe(
            (state) => state.scores >= state.maxScores || state.steps <= 0,
            () => {
                this.stop();
                this.finish();
            },
            { firstStart: false }
        );
    }

    updateSceneCycle(): void {
        const dt = this.time.delta;

        for (const tween of this._tweens.values()) {
            tween.update();
        }

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
            this._stopClicking = false;
        }
    }

    onDestroyTiles(tiles: Tile[]) {
        const { scores, steps } = this.store.state;
        this.store.setState({
            scores: scores + tiles.length,
            steps: steps - 1,
        });
    }

    onClickGrid = (cell: Cell) => {
        if (this._stopClicking) {
            return;
        }

        // Destroy the batch of tiles
        const cells = this.getCellsBatch(cell);
        if (cells.size >= this._minBatchSize) {
            this._stopClicking = true;
            this.destroyTiles(cells);
        }

        this._grid.forEachColumn(this.generateTopTiles);
    };

    destroyTiles(cells: Iterable<Cell>) {
        const tiles: Tile[] = [];
        for (const cell of cells) {
            const { tile } = cell;
            if (tile !== null) {
                this.destroyTile(tile);
                tiles.push(tile);
            }
            cell.tile = null;
        }

        this.onDestroyTiles(tiles);
    }

    generateTopTiles = (column: Cell[], col: number) => {
        // TODO: split by
        // getEmptyCells => Cell[]
        // addTilesToFall()

        let emptyCells = 0;
        for (let ci = column.length - 1; ci >= 0; ci--) {
            const cell = column[ci];
            const { tile } = cell;

            if (tile === null) {
                emptyCells++;
            }

            if (tile !== null && emptyCells > 0) {
                // Now the tile is not attached to the cell, because it's falling
                cell.tile = null;
                const dst = column[ci + emptyCells];
                tile.container.zIndex = column.length - dst.row;
                this._tilesToFall.add({
                    tile,
                    dst,
                    delay: 0.2,
                });
            }
        }

        const { cellWidth, cellHeight } = this._grid;

        for (let ci = 0; ci < emptyCells; ci++) {
            const tile = this.generateTile();
            const dst = column[emptyCells - (ci + 1)];
            const cX = col * cellWidth;
            const cY = -(ci + 1) * cellHeight - tile.topPadding;

            tile.container.position.set(cX, cY);
            tile.container.zIndex = column.length - dst.row;

            this._tilesToFall.add({
                tile,
                dst,
                delay: 0.2,
            });
        }
    };

    fillGrid() {
        const { rows } = this._grid;

        this._grid.forEachCell((cell) => {
            const tile = this.generateTile();
            // TODO: replace this by accessors
            tile.container.position.copyFrom(cell.position);
            tile.container.zIndex = rows - cell.row;
            cell.tile = tile;
        });
    }

    generateTile(): Tile {
        const { cellWidth, cellHeight } = this._grid;
        const tileTypes = this._tileTypes;
        const randomTile = tileTypes[randi(0, tileTypes.length - 1)];

        const tile = new Tile({
            type: randomTile.type,
            position: new Point(),
            width: cellWidth,
            height: cellHeight,
            texture: randomTile.texture,
            zIndex: 0,
            scores: 1,
        });

        this._tiles.set(tile.id, tile);
        this._grid.container.addChild(tile.container);

        return tile;
    }

    shuffle() {
        this._grid.clear();

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

        const { cols, rows } = this._grid;
        tiles.forEach((tile, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const cell = this._grid.getCellByRowCol(row, col);

            tile.container.position.copyFrom(cell.position);
            tile.container.zIndex = rows - row;
            cell.tile = tile;
        });
    }

    getCellsBatch(cell: Cell, _cells: Set<Cell> = new Set()): Set<Cell> {
        const { tile } = cell;
        if (tile === null || _cells.has(cell)) {
            return _cells;
        }

        _cells.add(cell);

        // Skip diagonal neighbors (last 4)
        for (let ni = 0; ni < 4; ni++) {
            const mask = cell.neighbors[ni];
            if (mask === -1) {
                continue;
            }

            const neighborCell = this._grid.getCellByMask(mask);
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

        const { cellWidth, cellHeight } = this._grid;

        let circle = _circle;
        if (circle === undefined) {
            circle = new Circle(
                cell.position.x + cellWidth / 2,
                cell.position.y + cellHeight / 2,
                radius
            );
        }

        if (testCircleBox(circle, cell.box)) {
            _cells.add(cell);

            for (const mask of cell.neighbors) {
                const neighborCell = this._grid.getCellByMask(mask);
                this.blowUpTiles(neighborCell, radius, circle, _cells);
            }
        }

        return _cells;
    }

    async playDestroyAnimation(tile: Tile): Promise<void> {
        return new Promise((resolve) => {
            const { container } = tile;
            container.zIndex = 100;

            const tween = new Tween({
                scale: 1,
                alpha: 1,
            })
                .to({
                    scale: 0,
                    alpha: 0,
                })
                .easing(Easing.Quartic.In)
                .delay(Math.random() * 120)
                .duration(80)
                .onUpdate(({ scale, alpha }) => {
                    container.position.x += 2;
                    container.position.y += 2;
                    container.scale = scale;
                    container.alpha = alpha;
                })
                .onComplete(() => {
                    this._tweens.delete(tile);
                    resolve();
                })
                .start();

            this._tweens.set(tile, tween);
        });
    }

    destroyTile(tile: Tile) {
        this._tiles.delete(tile.id);
        this.playDestroyAnimation(tile).then(() => {
            this._grid.container.removeChild(tile.container);
        });
    }
}

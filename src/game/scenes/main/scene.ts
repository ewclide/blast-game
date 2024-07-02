import { Easing, Tween } from '@tweenjs/tween.js';
import { Context, BaseScene } from '@blast-game/framework';
import { randi, testCircleBox } from '@blast-game/core';
import { Circle, Point, Texture } from 'pixi.js';
import { MainState, MainStore } from './store';
import {
    ComponentManager,
    DestroyComponent,
    MovementComponent,
    ScoresComponent,
    Tile,
    TileEntity,
    TileFactory,
    ViewComponent,
} from './tile';
import { Cell, Grid } from './grid';
import { MainUI } from './ui';

export interface TileDescriptor {
    family: string;
    texture: Texture;
    scores: number;
}

export class MainScene extends BaseScene<MainState> {
    private _grid!: Grid;
    private _tiles: TileFactory;
    private _components: ComponentManager;
    private _tileTypes: TileDescriptor[] = [];
    private _tilesOnTop: TileEntity[] = [];
    private _stopClicking: boolean = false;
    private _minBatchSize: number = 2;

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
        this._tiles = new TileFactory(this._grid.container);
        this._components = new ComponentManager(
            this.time,
            this.store,
            this._tiles
        );
    }

    async init() {
        await super.init();

        this.generateTileTypes();
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

    generateTileTypes() {
        const { resources } = Context.get();
        // TODO
        const tileTypesConfig = [
            { family: 'red', view: 'tile-red', scores: 1 },
            { family: 'green', view: 'tile-green', scores: 1 },
            { family: 'blue', view: 'tile-blue', scores: 1 },
            { family: 'pink', view: 'tile-pink', scores: 1 },
            { family: 'yellow', view: 'tile-yellow', scores: 1 },
        ];

        const tileTypes: TileDescriptor[] = [];
        for (const { family, view, scores } of tileTypesConfig) {
            const texture = resources.get(Texture, view);
            tileTypes.push({ family, texture, scores });
        }

        this._tileTypes = tileTypes;
    }

    fillGrid() {
        const { rows } = this._grid;

        this._grid.forEachCell((cell) => {
            const tile = this.generateTile();
            tile.container.position.copyFrom(cell.position);
            tile.container.zIndex = rows - cell.row;
            tile.attach(cell);
        });
    }

    generateTile(): TileEntity {
        const { cellWidth, cellHeight } = this._grid;
        const tileTypes = this._tileTypes;
        const randomTile = tileTypes[randi(0, tileTypes.length - 1)];

        const tile = this._tiles.create({
            family: randomTile.family,
            position: new Point(),
            width: cellWidth,
            height: cellHeight,
            zIndex: 0,
        });

        const view = this._components.create(ViewComponent, {
            texture: randomTile.texture,
        });
        const scores = this._components.create(ScoresComponent, {
            scores: randomTile.scores,
        });
        const destroy = this._components.create(DestroyComponent);
        const movement = this._components.create(MovementComponent, {
            dst: new Point(),
            delay: 0.5,
        });

        this._components.attach(tile, view);
        this._components.attach(tile, scores);
        this._components.attach(tile, destroy);
        this._components.attach(tile, movement);

        return tile;
    }

    updateSceneCycle(): void {
        this._components.update();
        // if (!this._tilesToFall.size) {
        //     this._stopClicking = false;
        // }
    }

    onDestroyTiles(tiles: Tile[]) {
        // const { scores, steps } = this.store.state;
        // this.store.setState({
        //     scores: scores + tiles.length,
        //     steps: steps - 1,
        // });
    }

    onClickGrid = (cell: Cell) => {
        if (this._stopClicking) {
            return;
        }

        const currentTile = cell.attachment as TileEntity;
        if (currentTile === null) {
            return;
        }

        const tiles = this.getTilesBatch(currentTile);
        if (tiles.size >= this._minBatchSize) {
            this._stopClicking = true;
            console.log('_stopClicking = true');

            for (const tile of tiles) {
                const destroy = this._components.get(tile, DestroyComponent);
                destroy.activate();
                this._components.requestUpdate(destroy);
            }

            Promise.all(
                [...tiles].map((tile) => {
                    return new Promise<void>((resolve) => {
                        tile.onDestroy = resolve;
                    });
                })
            ).then(() => {
                console.log('destroy tiles', tiles.size);
                this._grid.forEachColumn((column, col) => {
                    this.generateTilesOnTop(column, col);
                });
            });
        }

        // if (attachment !== null) {
        //     const destroy = this._components.get(attachment, DestroyComponent);
        //     destroy.activate();
        //     this._components.requestUpdate(destroy);
        // }

        // for (let col = 0; col < this._grid.cols; col++) {
        //     const column = this._grid.getCol(col);
        //     const emptyCells = this.addTilesToFall(column);
        //     this.generateTilesOnTop(emptyCells, col, column);
        // }
    };

    destroyTiles(cells: Iterable<Cell>) {
        // const tiles: Tile[] = [];
        // for (const cell of cells) {
        //     const { tile } = cell;
        //     if (tile !== null) {
        //         this.destroyTile(tile);
        //         tiles.push(tile);
        //     }
        //     cell.tile = null;
        // }
        // this.onDestroyTiles(tiles);
    }

    generateTilesOnTop(column: Cell[], index: number) {
        const movements = new Set<MovementComponent>();

        let emptyCells = 0;
        for (let ci = column.length - 1; ci >= 0; ci--) {
            const cell = column[ci];
            const tile = cell.attachment as TileEntity;

            if (tile === null) {
                emptyCells++;
            }

            if (tile !== null && emptyCells > 0) {
                const dstCell = column[ci + emptyCells];
                tile.container.zIndex = column.length - dstCell.row;

                const movement = this._components.get(tile, MovementComponent);
                movement.setDstCell(dstCell);
                this._components.requestUpdate(movement);
                movements.add(movement);
            }
        }

        const { cellWidth, cellHeight } = this._grid;
        for (let ci = 0; ci < emptyCells; ci++) {
            const tile = this.generateTile();
            const dstCell = column[emptyCells - (ci + 1)];
            const cX = index * cellWidth;
            const cY = -(ci + 1) * cellHeight - this._grid.topPadding;

            tile.container.position.set(cX, cY);
            tile.container.zIndex = column.length - dstCell.row;

            const movement = this._components.get(tile, MovementComponent);
            movement.setDstCell(dstCell);
            this._components.requestUpdate(movement);
            movements.add(movement);
        }

        Promise.all(
            [...movements].map((movement) => {
                return new Promise<void>((resolve) => {
                    movement.onComplete = resolve;
                });
            })
        ).then(() => {
            console.log('_stopClicking = false');
            this._stopClicking = false;
        });
    }

    shuffle() {
        this._grid.clear();

        const tiles = this._grid.getAllAttachments() as TileEntity[];

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
            if (cell !== null) {
                tile.container.position.copyFrom(cell.position);
                tile.container.zIndex = rows - row;
                cell.attachment = tile;
            }
        });
    }

    getTilesBatch(
        tile: TileEntity,
        _batch: Set<TileEntity> = new Set()
    ): Set<TileEntity> {
        if (_batch.has(tile)) {
            return _batch;
        }

        _batch.add(tile);

        for (const neighbor of tile.getNeighbors()) {
            if (neighbor.family === tile.family) {
                this.getTilesBatch(neighbor, _batch);
            }
        }

        return _batch;
    }

    // blowUpTiles(
    //     cell: Cell,
    //     radius: number,
    //     _circle?: Circle,
    //     _cells = new Set<Cell>()
    // ): Set<Cell> {
    //     const { tile } = cell;
    //     if (tile === null || _cells.has(cell)) {
    //         return _cells;
    //     }

    //     const { cellWidth, cellHeight } = this._grid;

    //     let circle = _circle;
    //     if (circle === undefined) {
    //         circle = new Circle(
    //             cell.position.x + cellWidth / 2,
    //             cell.position.y + cellHeight / 2,
    //             radius
    //         );
    //     }

    //     if (testCircleBox(circle, cell.box)) {
    //         _cells.add(cell);

    //         for (const mask of cell.neighbors) {
    //             const neighborCell = this._grid.getCellByMask(mask);
    //             this.blowUpTiles(neighborCell, radius, circle, _cells);
    //         }
    //     }

    //     return _cells;
    // }

    // destroyTile(tile: Tile) {
    // this._tiles.delete(tile.id);
    // this.playDestroyAnimation(tile).then(() => {
    //     this._grid.container.removeChild(tile.container);
    // });
    // }
}

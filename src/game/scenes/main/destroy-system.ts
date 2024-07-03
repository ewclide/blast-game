import { Easing, Tween } from '@tweenjs/tween.js';
import { testCircleBox } from '@blast-game/core';
import { Cell, Grid } from './grid';
import { Circle } from 'pixi.js';
import { Tile } from './tile';

export interface DestroyStrategy {
    requestToDestroy: (cell: Cell) => Set<Cell> | null;
}

export class OneCellDestroyStrategy implements DestroyStrategy {
    requestToDestroy(cell: Cell) {
        return new Set([cell]);
    }
}

export class BatchDestroyStrategy implements DestroyStrategy {
    constructor(private _grid: Grid, public minBatchSize: number) {}

    requestToDestroy(cell: Cell) {
        const batch = this._getBatch(cell);
        return batch.size >= this.minBatchSize ? batch : null;
    }

    private _getBatch(cell: Cell, _cells: Set<Cell> = new Set()) {
        const { tile } = cell;
        if (tile === null || _cells.has(cell)) {
            return _cells;
        }

        _cells.add(cell);

        // Skip diagonal neighbors (last 4)
        for (let ni = 0; ni < 4; ni++) {
            const mask = cell.neighbors[ni];
            const neighborCell = this._grid.getCellByMask(mask);
            if (neighborCell === null) {
                continue;
            }

            const neighborTile = neighborCell.tile;
            if (neighborTile !== null && neighborTile.family === tile.family) {
                this._getBatch(neighborCell, _cells);
            }
        }

        return _cells;
    }
}

export class CircleDestroyStrategy implements DestroyStrategy {
    constructor(private _grid: Grid, public radius: number) {}

    requestToDestroy(
        cell: Cell,
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
                this.radius
            );
        }

        if (testCircleBox(circle, cell.box)) {
            _cells.add(cell);

            for (const mask of cell.neighbors) {
                const neighborCell = this._grid.getCellByMask(mask);
                if (neighborCell) {
                    this.requestToDestroy(neighborCell, circle, _cells);
                }
            }
        }

        return _cells;
    }
}

export class DestroySystem {
    private _grid: Grid;
    private _minBatchSize: number = 2;
    private _tweens: Map<Tile, Tween<any>> = new Map();

    destroyStrategy: DestroyStrategy = new OneCellDestroyStrategy();
    onDestroyTiles = (tiles: Tile[]) => {};

    constructor(grid: Grid) {
        this._grid = grid;
    }

    update(dt: number): void {
        for (const tween of this._tweens.values()) {
            tween.update();
        }
    }

    destroy(cell: Cell): Tile[] {
        // Destroy the batch of tiles
        const cells = this.destroyStrategy.requestToDestroy(cell);
        if (cells !== null) {
            return this._destroyTiles(cells);
        }

        return [];
    }

    private _destroyTiles(cells: Iterable<Cell>): Tile[] {
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
        return tiles;
    }

    private async _playDestroyAnimation(tile: Tile): Promise<void> {
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

    async destroyTile(tile: Tile): Promise<void> {
        await this._playDestroyAnimation(tile);
        this._grid.container.removeChild(tile.container);
    }
}

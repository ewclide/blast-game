import { Tile } from './tile';
import { Cell } from './grid';

const TILE_ACCEL = 3000;

export class MovementSystem {
    private _tilesToMove = new Set<{
        tile: Tile;
        dst: Cell;
        delay: number;
    }>();

    get tilesToMoveCount(): number {
        return this._tilesToMove.size;
    }

    update(dt: number): void {
        for (const tileData of this._tilesToMove) {
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
                this._tilesToMove.delete(tileData);
            }
        }
    }

    moveHoveredTiles(column: Cell[], col: number): number {
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
                this.addTile(tile, dst);
            }
        }

        return emptyCells;
    }

    addTile(tile: Tile, dst: Cell) {
        this._tilesToMove.add({
            tile,
            dst,
            delay: 0.2,
        });
    }
}

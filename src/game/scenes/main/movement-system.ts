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

    addTile(tile: Tile, dst: Cell) {
        this._tilesToMove.add({
            tile,
            dst,
            delay: 0.2,
        });
    }
}

import { Point, Sprite, Texture } from 'pixi.js';
import { TileType } from './game';

export interface TileOptions {
    type: TileType;
    width: number;
    height: number;
    position: Point;
    texture: Texture;
    zIndex: number;
}

let tileID = 0;
export class Tile {
    readonly id = tileID++;
    readonly type: TileType;
    readonly sprite: Sprite;
    speed: number = 0;

    constructor(options: TileOptions) {
        const { width, height, position, type, texture, zIndex } = options;

        const sizeFactor = texture.height / texture.width;
        const sprite = new Sprite(texture);
        sprite.position.copyFrom(position);
        sprite.width = width;
        sprite.height = height * sizeFactor;
        sprite.zIndex = zIndex;

        this.type = type;
        this.sprite = sprite;
    }
}

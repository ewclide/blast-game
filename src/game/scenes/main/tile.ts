import { Container, Point, Sprite, Texture } from 'pixi.js';

export type TileFamily = string;

export interface TileOptions {
    family: TileFamily;
    width: number;
    height: number;
    position: Point;
    texture: Texture;
    zIndex: number;
    scores: number;
}

let tileID = 0;
export class Tile {
    readonly id = tileID++;
    readonly family: TileFamily;
    readonly sprite: Sprite;
    readonly container: Container;
    readonly topPadding: number;
    readonly scores: number;
    speed: number = 0;

    constructor(options: TileOptions) {
        const { width, height, position, family, texture, zIndex, scores } =
            options;

        const sizeFactor = texture.height / texture.width;
        const topPadding = height * (sizeFactor - 1);

        const container = new Container();
        container.position.copyFrom(position);

        const sprite = new Sprite(texture);
        sprite.position.y -= topPadding;
        sprite.width = width;
        sprite.height = height * sizeFactor;
        sprite.zIndex = zIndex;

        container.addChild(sprite);

        this.family = family;
        this.sprite = sprite;
        this.container = container;
        this.topPadding = topPadding;
        this.scores = scores;
    }
}

import { Container, Point, Sprite, Texture } from 'pixi.js';
import { TileType } from './game';

export interface TileOptions {
    type: TileType;
    width: number;
    height: number;
    position: Point;
    texture: Texture;
    zIndex: number;
}

export interface IBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export class Box implements IBox {
    constructor(
        public minX: number = 0,
        public minY: number = 0,
        public maxX: number = 0,
        public maxY: number = 0
    ) {}

    containPoint(point: Point): boolean {
        const { x, y } = point;
        return (
            x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY
        );
    }

    containBox(box: IBox) {
        return (
            box.minX >= this.minX &&
            box.maxX <= this.maxX &&
            box.minY >= this.minY &&
            box.maxY <= this.maxY
        );
    }

    intersectBox(box: IBox): boolean {
        return (
            this.minX < box.maxX &&
            this.maxX > box.minX &&
            this.minY < box.maxY &&
            this.maxY > box.minY
        );
    }

    intersectBoxPredict(box: IBox, offset: Point): boolean {
        return (
            this.minX + offset.x < box.maxX &&
            this.maxX + offset.x > box.minX &&
            this.minY + offset.y < box.maxY &&
            this.maxY + offset.y > box.minY
        );
    }
}

let tileID = 0;
export class Tile {
    readonly id = tileID++;
    readonly type: TileType;
    readonly container: Container;
    readonly sprite: Sprite;
    readonly topPadding: number;
    readonly width: number;
    readonly height: number;
    readonly mass: number = 1;
    readonly speed: Point = new Point();
    readonly box: Box;
    isStatic: boolean = true;

    constructor(options: TileOptions) {
        const { width, height, position, type, texture, zIndex } = options;

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

        this.type = type;
        this.sprite = sprite;
        this.container = container;
        this.width = width;
        this.height = height;
        this.topPadding = topPadding;
        this.box = new Box(
            position.x,
            position.y,
            position.x + width,
            position.y + height
        );
    }

    setPosition(x: number, y: number) {
        this.container.position.set(x, y);
        this.updateBox();
    }

    updateBox() {
        const { position } = this.container;
        this.box.minX = position.x;
        this.box.minY = position.y;
        this.box.maxX = position.x + this.width;
        this.box.maxY = position.y + this.height;
    }
}

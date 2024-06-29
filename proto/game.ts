import { Application, Assets, Texture } from 'pixi.js';
import { Grid, GridOptions, TileTypeDescriptor } from './grid';
import { ResourceManager } from './resource';
import { InputSystem } from './input';
import { TimeSystem } from './time';
import { UI } from './ui';

export interface AssetsDescriptor {
    tiles: { type: string; image: string }[];
}

export type ImageName = string;
export type ImagePath = string;
export type TileType = number | string;

export interface GameOptions {
    grid: GridOptions;
    assets: Record<ImageName, ImagePath>;
    tileTypes: Record<TileType, ImageName>;
}

export interface InternalAssets {
    tileTypes: Map<TileType, Texture>;
    textures: Map<string, Texture>;
}

export class Game {
    readonly time: TimeSystem;
    readonly input: InputSystem;
    readonly grid: Grid;
    readonly options: GameOptions;
    readonly resouces: ResourceManager;
    readonly ui: UI;

    constructor(pixi: Application, options: GameOptions) {
        this.time = new TimeSystem();
        this.input = new InputSystem(pixi.canvas);
        this.grid = new Grid(options.grid);
        this.resouces = new ResourceManager({
            textures: options.assets,
        });
        this.resouces.register({
            textures: Texture,
        });
        this.options = options;

        // TODO: pass props (like grid size)
        this.ui = new UI(pixi, this.resouces);

        this.ui.layout.attach('grid', this.grid.container);

        pixi.stage.addChild(this.grid.container);
    }

    async start() {
        await this.resouces.load();

        const tiles: TileTypeDescriptor[] = [];
        for (const [type, image] of Object.entries(this.options.tileTypes)) {
            const texture = this.resouces.get(Texture, image);
            tiles.push({ type, texture });
        }

        this.grid.create(tiles);
        this.ui.create();
    }

    update = () => {
        this.time.update();
        this.logicUpdate();
        this.input.lateUpdate();
    };

    logicUpdate() {
        this.grid.update(this.time);

        const click = this.input.click;
        if (click) {
            this.grid.click(click);
        }
    }
}

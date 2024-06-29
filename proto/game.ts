import { Application, Texture } from 'pixi.js';
import { Grid, GridOptions, TileTypeDescriptor } from './grid';
import { ResourceManager } from './resource';
import { InputSystem } from './input';
import { TimeSystem } from './time';
import { Store } from './store';
import { Tile } from './tile';
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

export interface GameStore {
    scores: number;
    steps: number;
    maxScores: number;
}

export class Game {
    readonly time: TimeSystem;
    readonly input: InputSystem;
    readonly grid: Grid;
    readonly options: GameOptions;
    readonly resouces: ResourceManager;
    readonly store: Store<GameStore>;
    readonly ui: UI;

    constructor(pixi: Application, options: GameOptions) {
        this.options = options;
        this.store = new Store<GameStore>({
            scores: 0,
            steps: 0,
            maxScores: 0,
        });

        this.time = new TimeSystem();
        this.input = new InputSystem(pixi.canvas);
        this.grid = new Grid(options.grid);
        this.resouces = new ResourceManager({
            textures: options.assets,
        });
        this.resouces.register({
            textures: Texture,
        });

        // TODO: pass props (like grid size)
        this.ui = new UI(pixi, this.resouces, this.store);
        this.ui.layout.attach('grid', this.grid.container);

        this.grid.onDestroyTiles = (tiles: Tile[]) => {
            const { scores, steps } = this.store.state;
            this.store.setState({
                scores: scores + tiles.length,
                steps: steps - 1,
            });
        };

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

        this.store.setState({
            scores: 0,
            steps: 50,
            maxScores: 100,
        });
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

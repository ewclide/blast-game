import { Application } from 'pixi.js';
import { Game } from './game';

export class App {
    private _game!: Game;

    constructor(public container: HTMLElement) {}

    async init() {
        const pixi = new Application();
        await pixi.init({
            width: 1024,
            height: 900,
            background: 0xffffff,
        });

        this.container.appendChild(pixi.canvas);

        const game = new Game(pixi, {
            field: {
                width: 800,
                height: 800,
                padding: 10,
                sizeX: 9,
                sizeY: 9,
                minBatchSize: 2,
            },
            assets: {
                'tile-blue': 'images/tile-blue.png',
                'tile-red': 'images/tile-red.png',
                'tile-pink': 'images/tile-pink.png',
                'tile-yellow': 'images/tile-yellow.png',
                'tile-green': 'images/tile-green.png',
            },
            tileTypes: {
                red: 'tile-red',
                green: 'tile-green',
                blue: 'tile-blue',
                pink: 'tile-pink',
                yellow: 'tile-yellow',
            },
        });

        this._game = game;
        this._game.start();

        pixi.ticker.add(game.update);

        console.log(this);
    }
}

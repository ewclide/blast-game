import { Context, IGame } from '@blast-game/framework';
import { BlasterGameConfig, Game } from './game';
import { gameConfig } from './config';
import { assets } from './assets';

export class App {
    private _game!: IGame;
    private _context: Context<BlasterGameConfig>;

    constructor(container: HTMLElement) {
        this._context = new Context(container, gameConfig);
        console.log(this);
    }

    async init() {
        await this._context.init();

        const game = new Game(assets);
        this._game = game;

        await this._game.init();
    }
}

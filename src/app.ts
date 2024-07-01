import { Context, IGame } from './framework';
import { assets } from './assets';
import { Game } from './game';

export class App {
    private _game!: IGame;
    private _context: Context;

    constructor(container: HTMLElement) {
        this._context = new Context(container);
        console.log(this);
    }

    async init() {
        await this._context.init();
        console.log('before game.init');

        const game = new Game(assets);
        this._game = game;

        await this._game.init();
        console.log('after game init');
    }
}

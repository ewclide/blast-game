import { Context } from './framework';
import { BlastGame } from './game';

export class App {
    private _game!: BlastGame;
    private _context: Context;

    constructor(container: HTMLElement) {
        this._context = new Context(container);
        console.log(this);
    }

    async init() {
        await this._context.init();
        console.log('before game.init');

        const game = new BlastGame();
        this._game = game;
        await this._game.init();
        console.log('after game init');

        this._context.pixi.ticker.add(game.update);
    }
}

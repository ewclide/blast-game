import { Application } from 'pixi.js';

export class App {
    constructor(public container: HTMLElement) {}

    async init() {
        const app = new Application();
        await app.init({
            width: 900,
            height: 900,
            background: 0xff0000,
        });

        this.container.appendChild(app.canvas);
    }
}

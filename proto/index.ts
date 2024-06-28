import { App } from './app';

async function main() {
    const container = document.getElementById('app');
    if (container === null) {
        throw new Error();
    }

    const app = new App(container);
    app.init();
}

main();

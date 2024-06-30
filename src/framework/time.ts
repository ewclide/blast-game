export class TimeSystem {
    time: number = 0;
    delta: number = 0;
    elapsed: number = 0;
    scale: number = 1;

    private _stop: boolean = false;

    update(): void {
        if (this._stop) {
            return;
        }

        const time = performance.now();

        this.delta = (time - this.time) * this.scale * 0.001;
        this.elapsed += this.delta;
        this.time = time;
    }

    stop(): void {
        this._stop = true;
    }

    start(): void {
        this.time = performance.now();
        this._stop = false;
    }
}

export type StoreState = Record<string, any>;
export type StoreSelector<S extends StoreState> = (state: S) => unknown;
export type StoreTarget<S extends StoreState> = keyof S | StoreSelector<S>;
export type StoreCallback<S extends StoreState> = (
    value: any,
    state: S
) => void;

export class Store<S extends StoreState> {
    private _state: S;
    private _cache: Map<StoreSelector<S>, unknown> = new Map();
    private _selectors: Map<keyof S, StoreSelector<S>> = new Map();
    private _subscribers: Map<StoreSelector<S>, Set<StoreCallback<S>>> =
        new Map();

    get state() {
        return this._state;
    }

    constructor(initialState: S) {
        this._state = { ...initialState };
        this._cache = new Map();

        this.setState(initialState);
    }

    subscribe(target: StoreTarget<S>, callback: StoreCallback<S>) {
        const selector = this._createSelector(target);

        let callbacks = this._subscribers.get(selector);
        if (callbacks === undefined) {
            callbacks = new Set();
            this._subscribers.set(selector, callbacks);
        }

        if (this._cache.has(selector) === false) {
            this._cache.set(selector, selector(this._state));
        }

        callbacks.add(callback);
    }

    unsubscribe(target: StoreTarget<S>, callback: StoreCallback<S>) {
        const { key, selector } = this._getSelector(target);
        if (!selector) {
            return;
        }

        const callbacks = this._subscribers.get(selector);
        if (callbacks === undefined || !callbacks.size) {
            this._subscribers.delete(selector);
            if (key) {
                this._selectors.delete(key);
            }
        } else {
            callbacks.delete(callback);
        }
    }

    setState(state: Partial<S>) {
        this._state = Object.assign(this._state, state);
        const cache = this._cache;

        for (const [selector, callbacks] of this._subscribers) {
            const value = selector(this._state);
            if (cache.get(selector) !== value) {
                cache.set(selector, value);
                for (const callback of callbacks) {
                    callback(value, this._state);
                }
            }
        }
    }

    private _getSelector(target: StoreTarget<S>): {
        key?: keyof S;
        selector?: StoreSelector<S>;
    } {
        let key: keyof S | undefined;
        let selector: StoreSelector<S> | undefined;
        if (typeof target === 'function') {
            selector = target;
        } else {
            selector = this._selectors.get(target);
            key = target;
        }

        return { key, selector };
    }

    private _createSelector(target: StoreTarget<S>): StoreSelector<S> {
        if (typeof target === 'function') {
            return target;
        }

        let selector = this._selectors.get(target);
        if (selector === undefined) {
            selector = () => this._state[target];
            this._selectors.set(target, selector);
        }

        return selector;
    }
}

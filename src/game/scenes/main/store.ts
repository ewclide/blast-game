import { IStore, Store } from '@blast-game/core';

export interface MainState {
    scores: number;
    steps: number;
    maxScores: number;
    shuffles: number;
    boosters: number;
}

export type MainStore = IStore<MainState>;

// Realization
export function createMainStore(): MainStore {
    return new Store<MainState>({
        scores: 0,
        steps: 0,
        maxScores: 0,
        shuffles: 0,
        boosters: 0,
    });
}

import { Store } from '../../../core';

export interface MainState {
    scores: number;
    steps: number;
    maxScores: number;
}

export type MainStore = Store<MainState>;

export function createMainStore(): MainStore {
    return new Store<MainState>({
        scores: 0,
        steps: 0,
        maxScores: 0,
    });
}

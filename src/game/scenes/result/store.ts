import { IStore, Store } from '../../../core';

export enum GameResult {
    WIN,
    LOSE,
    NONE,
}

export interface ResultState {
    result: GameResult;
}

export type ResultStore = IStore<ResultState>;

// Realization
export function createResultStore(): ResultStore {
    return new Store<ResultState>({
        result: GameResult.NONE,
    });
}

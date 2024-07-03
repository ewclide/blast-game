import { BlasterGameConfig } from './game';

export const gameConfig: BlasterGameConfig = {
    steps: 25,
    maxScores: 100,
    shuffles: 5,
    bombBoosters: 5,
    minBatchSize: 2,
    circleDamageRadius: 110,
    cols: 10,
    rows: 10,
    tileTypes: [
        { family: 'red', image: 'tile-red', scores: 1 },
        { family: 'green', image: 'tile-green', scores: 1 },
        { family: 'blue', image: 'tile-blue', scores: 1 },
        { family: 'pink', image: 'tile-pink', scores: 1 },
        { family: 'yellow', image: 'tile-yellow', scores: 1 },
    ],
};

import { Context, GameConfig } from '@blast-game/framework';

export interface TileTypeConfigItem {
    family: string;
    image: string;
    scores: number;
}

export interface BlasterGameConfig extends GameConfig {
    steps: number;
    maxScores: number;
    shuffles: number;
    bombBoosters: number;
    minBatchSize: number;
    circleDamageRadius: number;
    cols: number;
    rows: number;
    tileTypes: TileTypeConfigItem[];
}

export const getGameConfig = () => Context.get<BlasterGameConfig>();

import { Text } from 'pixi.js';
import { BaseUI } from '@blast-game/framework';
import { ProgressBar } from '@pixi/ui';
import { MainState } from './store';

export class MainUI extends BaseUI<MainState> {
    async init() {
        await super.init();

        const { layout } = this;
        const steps = layout.getContainer('steps').view as Text;
        const scores = layout.getContainer('scores').view as Text;
        const maxScores = layout.getContainer('max-scores').view as Text;
        const shuffles = layout.getContainer('shuffle-text').view as Text;
        const boosters = layout.getContainer('booster-bomb-text').view as Text;
        const progress = layout.getContainer('progress-bar')
            .view as ProgressBar;

        // Sync store with ui
        const { store } = this;

        store.subscribe('maxScores', (value: number) => {
            maxScores.text = value;
        });

        store.subscribe('scores', (value: number) => {
            scores.text = `ОЧКИ:\n${value}`;
        });

        store.subscribe('steps', (value: number) => {
            steps.text = value;
        });

        store.subscribe('shuffles', (value: number) => {
            shuffles.text = `перемешать (${value})`;
        });

        store.subscribe('boosters', (value: number) => {
            boosters.text = `бомба\n(${value})`;
        });

        store.subscribe(
            (state) => (state.scores / state.maxScores) * 100,
            (value) => {
                progress.progress = value;
            }
        );
    }
}

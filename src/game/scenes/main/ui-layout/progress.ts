import { LayoutProgress, LayoutText } from '../../../../pixi';
import { LayoutSection } from '../../../../core/layout';

const progressBar: LayoutProgress = {
    type: 'progress',
    fill: 'progress-fill',
    bg: 'progress-bg',
    value: 50,
};

const progresText: LayoutText = {
    type: 'text',
    text: 'ПРОГРЕСС',
    anchor: { x: 0.5, y: 0.5 },
    style: {
        fill: 0xffffff,
        fontWeight: 'bolder',
        fontFamily: 'marvin',
        fontSize: 32,
        align: 'center',
    },
};

export const progressSection: LayoutSection = {
    block: {
        width: '500px',
        height: '130px',
        alignY: 'start',
        alighX: 'start',
        direction: 'vertical',
        content: {
            type: 'texture',
            textureId: 'progress-back',
        },
        sections: [
            {
                height: '50px',
                block: {
                    width: '0px',
                    height: '0px',
                    alignY: 'end',
                    content: progresText,
                },
            },
            {
                block: {
                    id: 'progress-bar',
                    width: '430px',
                    height: '35px',
                    content: progressBar,
                },
            },
        ],
    },
};

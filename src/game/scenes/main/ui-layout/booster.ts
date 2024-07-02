import { LayoutBlock, LayoutSection } from '@blast-game/core';

const getBoosterButtonLayout = (id: string, title: string): LayoutBlock => ({
    id,
    height: '140px',
    direction: 'vertical',
    content: {
        type: 'button',
        textureId: 'booster-back',
    },
    sections: [
        {
            height: '60%',
            block: {
                id: id + '-text',
                width: '0px',
                height: '0px',
                alignY: 'start',
                offsetY: '50px',
                content: {
                    type: 'text',
                    text: title,
                    anchor: { x: 0.5, y: 0.5 },
                    style: {
                        fill: 0xffffff,
                        fontWeight: 'bolder',
                        fontFamily: 'marvin',
                        fontSize: 18,
                        align: 'center',
                    },
                },
            },
        },
        {
            height: '40%',
            block: {
                id: id + '-switcher',
                height: '38px',
                width: '90px',
                offsetY: '20px',
                alignY: 'end',
                content: {
                    type: 'switcher',
                    imageOn: 'switch-on',
                    imageOff: 'switch-off',
                },
            },
        },
    ],
});

export const boosterSection: LayoutSection = {
    direction: 'horizontal',
    height: '200px',
    sections: [
        {
            block: getBoosterButtonLayout('booster-bomb', 'бомба\n(15)'),
        },
        {
            block: getBoosterButtonLayout('booster-teleport', 'телепорт\n(25)'),
        },
        {
            block: getBoosterButtonLayout('booster-extra', 'ничего\n(100)'),
        },
    ],
};

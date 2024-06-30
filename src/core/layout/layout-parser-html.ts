import { LayoutBlock, LayoutSection } from './layout-description';
import { ILayoutParser, LayoutRect } from './layout-parser';

export class LayoutParserHTML implements ILayoutParser {
    private _htmlHelpers: Map<string, HTMLDivElement> = new Map();

    calc(
        canvas: HTMLCanvasElement,
        root: LayoutSection,
        rects: Map<string, LayoutRect>
    ) {
        const rect = canvas.getBoundingClientRect();
        const helpers = this._createSection(root);

        Object.assign(helpers.style, {
            position: 'absolute',
            top: rect.x + 'px',
            left: rect.y + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
        });

        document.body.appendChild(helpers);

        for (const [key, div] of this._htmlHelpers) {
            const { x, y, width, height } = div.getBoundingClientRect();
            rects.set(key, { x, y, width, height });
        }

        document.body.removeChild(helpers);
        this._htmlHelpers.clear();
    }

    private _createSection(props: LayoutSection): HTMLDivElement {
        const { sections, block } = props;

        const div = this._createElement(props);

        if (block) {
            const subDiv = this._createBlock(div, block);
            div.appendChild(subDiv);
            return div;
        }

        if (sections) {
            for (const section of sections) {
                const subDiv = this._createSection(section);
                div.appendChild(subDiv);
            }
        }

        return div;
    }

    private _createBlock(
        root: HTMLDivElement,
        props: LayoutBlock
    ): HTMLDivElement {
        const {
            alighX = 'center',
            alignY = 'center',
            offsetX,
            offsetY,
            sections,
            block,
        } = props;

        const div = this._createElement(props);

        const margin: Record<string, string> = {};
        if (offsetX) {
            if (alighX === 'start') {
                margin.marginLeft = offsetX;
            } else if (alighX === 'end') {
                margin.marginRight = offsetX;
            }
        }
        if (offsetY) {
            if (alignY === 'start') {
                margin.marginTop = offsetY;
            } else if (alignY === 'end') {
                margin.marginBottom = offsetY;
            }
        }

        Object.assign(root.style, {
            justifyContent: alighX,
            alignItems: alignY,
        });

        Object.assign(div.style, margin);

        if (block) {
            const subDiv = this._createBlock(div, block);
            div.appendChild(subDiv);
            return div;
        }

        if (sections) {
            for (const section of sections) {
                const subDiv = this._createSection(section);
                div.appendChild(subDiv);
            }
        }

        return div;
    }

    private _createElement(props: LayoutSection): HTMLDivElement {
        const {
            id,
            width = '100%',
            height = '100%',
            direction = 'horizontal',
        } = props;

        const div = document.createElement('div');
        Object.assign(div.style, {
            width,
            height,
            display: 'flex',
            flexDirection: direction === 'vertical' ? 'column' : 'row',
            border: '1px dashed red',
            boxSizing: 'border-box',
            zIndex: 1000,
        });

        if (!id) {
            return div;
        }

        if (this._htmlHelpers.has(id)) {
            throw new Error();
        }

        this._htmlHelpers.set(id, div);
        return div;
    }
}

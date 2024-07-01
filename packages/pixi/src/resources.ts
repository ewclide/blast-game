import { Assets, Texture } from 'pixi.js';
import {
    ResourceManager,
    ResourceConfig,
    ResourceName,
    ResourcePath,
} from '@blast-game/core';

export type PixiResource = Texture | FontFace;

export interface ResourcesPixiConfig extends ResourceConfig {
    textures?: Record<ResourceName, ResourcePath>;
    fonts?: Record<ResourceName, ResourcePath>;
}

export class ResourcesPixi extends ResourceManager<PixiResource> {
    async load(
        config: ResourcesPixiConfig,
        progress: (v: number) => void = () => {}
    ) {
        const onLoadResources: (() => void)[] = [];
        const bundle: any[] = [];

        let uid = 0;
        for (const [type, builder] of this._resourceTypes) {
            const resources = config[type as keyof ResourceConfig];
            if (resources === undefined) {
                continue;
            }

            const resourcesMap = this._getResourceMap(builder);
            for (const [name, path] of Object.entries(resources)) {
                if (resourcesMap.has(name)) {
                    console.warn(`Dublicate resource ${name}`);
                    continue;
                }

                const alias = name + uid++;

                onLoadResources.push(() => {
                    const resouce = Assets.cache.get(alias);
                    if (resouce === undefined) {
                        throw new Error(`Error of loading resource`);
                    }

                    resourcesMap.set(name, resouce);
                });

                bundle.push({ alias, src: path });
            }
        }

        Assets.addBundle('main', bundle);
        await Assets.loadBundle('main', progress);

        onLoadResources.forEach((onload) => onload());

        Assets.cache.reset();
    }
}

import { Assets, Texture } from 'pixi.js';

export type ResourceConstructor<T extends Resource = Resource> = new (
    ...args: any[]
) => T;

// TODO: font, sound ...
export type Resource = Texture | FontFace;
export type ResourceName = string;
export type ResourcePath = string;
export type ResourceTypes = Record<string, ResourceConstructor>;

export interface ResourceConfig {
    textures?: Record<ResourceName, ResourcePath>;
    fonts?: Record<ResourceName, ResourcePath>;
}

export class ResourceManager {
    private _config: ResourceConfig;
    private _resourceTypes: Map<string, ResourceConstructor> = new Map();
    private _resourcesByType: Map<ResourceConstructor, Map<string, Resource>> =
        new Map();

    constructor(config: ResourceConfig) {
        this._config = config;
    }

    register(resourceTypes: ResourceTypes) {
        for (const [type, builder] of Object.entries(resourceTypes)) {
            if (this._resourceTypes.has(type)) {
                throw new Error();
            }
            this._resourceTypes.set(type, builder);
            this._resourcesByType.set(builder, new Map());
        }
    }

    get<R extends Resource>(type: ResourceConstructor<R>, key: string): R {
        const resource = this._getResourceMap(type).get(key);
        if (resource === undefined) {
            throw new Error(`Unknown resouce key ${key}`);
        }

        return resource as R;
    }

    async load(progress: (v: number) => void = () => {}) {
        type AliasData = { name: string; builder: ResourceConstructor };
        const aliases = new Map<string, AliasData>();
        const bundle: any[] = [];

        let uid = 0;
        for (const [type, builder] of this._resourceTypes) {
            const resources = this._config[type as keyof ResourceConfig];
            if (resources === undefined) {
                continue;
            }
            for (const [name, path] of Object.entries(resources)) {
                const alias = name + uid++;
                aliases.set(alias, { name, builder });
                bundle.push({ alias, src: path });
            }
        }

        Assets.addBundle('main', bundle);
        await Assets.loadBundle('main', progress);

        for (const [alias, data] of aliases) {
            const resouce = Assets.cache.get(alias);
            if (resouce === undefined) {
                throw new Error(`Error of loading resource`);
            }

            const resouces = this._getResourceMap(data.builder);
            resouces.set(data.name, resouce);
        }

        Assets.cache.reset();
    }

    private _getResourceMap(type: ResourceConstructor): Map<string, Resource> {
        const resouces = this._resourcesByType.get(type);
        if (resouces === undefined) {
            throw new Error(`Unknown resource type ${type}`);
        }

        return resouces;
    }
}

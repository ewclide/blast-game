export type ResourceConstructor<T = any> = new (...args: any[]) => T;
export type ResourceName = string;
export type ResourcePath = string;
export type ResourceTypes = Record<string, ResourceConstructor>;

export interface ResourceConfig {
    [key: string]: Record<ResourceName, ResourcePath> | undefined;
}

export abstract class ResourceManager<R = any> {
    protected _resourceTypes: Map<string, ResourceConstructor> = new Map();
    protected _resourcesByType: Map<ResourceConstructor, Map<string, R>> =
        new Map();

    register(resourceTypes: ResourceTypes) {
        for (const [type, builder] of Object.entries(resourceTypes)) {
            if (this._resourceTypes.has(type)) {
                throw new Error();
            }
            this._resourceTypes.set(type, builder);
            this._resourcesByType.set(builder, new Map());
        }
    }

    get<T extends R>(type: ResourceConstructor<T>, key: string): T {
        const resource = this._getResourceMap(type).get(key);
        if (resource === undefined) {
            throw new Error(`Unknown resouce key ${key}`);
        }

        return resource as T;
    }

    abstract load(
        config: ResourceConfig,
        progress?: (v: number) => void
    ): Promise<void>;

    protected _getResourceMap(type: ResourceConstructor): Map<string, R> {
        const resouces = this._resourcesByType.get(type);
        if (resouces === undefined) {
            throw new Error(`Unknown resource type ${type}`);
        }

        return resouces;
    }
}

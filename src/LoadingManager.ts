import { AssetContainer, AssetsManager, AssetTaskState, BinaryFileAssetTask, ContainerAssetTask, Scene, Texture, TextureAssetTask } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export class LoadingManager {
    private _scene: Scene;
    
    private _assetsManager: AssetsManager;

    private _containers: Map<string, ContainerAssetTask>;
    private _sounds: Map<string, BinaryFileAssetTask>;
    private _textures: Map<string, TextureAssetTask>;

    private _allSuccessful: boolean;

    constructor(scene: Scene) {
        this._scene = scene;

        this._assetsManager = new AssetsManager(this._scene);
        this._assetsManager.useDefaultLoadingScreen = false;

        this._containers = new Map();
        this._sounds = new Map();
        this._textures = new Map();

        this._allSuccessful = false;

        this.afterLoading();
    }

    public addContainerTask(id: string, path: string, filename: string): void {
        let containerTask = this._assetsManager.addContainerTask(id, null, path, filename);

        if(this._containers.has(id)) {
            console.warn("id already in use. ");
        }
        this._containers.set(id, containerTask);
    }

    public addSoundTask(id: string, path: string): void {
        let soundTask = this._assetsManager.addBinaryFileTask(id, path);

        if (this._sounds.has(id)) {
            console.warn("Id already in use. ");
        }
        this._sounds.set(id, soundTask);
    }

    public addTextureTask(
        id: string, 
        path: string, 
        options?: {
            flipY?: boolean,
            noMipmap?: boolean
        }
    ): void {
        // ToDo
        let textureTask = this._assetsManager.addTextureTask(
            id, 
            path,
            options?.noMipmap || false,
            options?.flipY || false
        );

        if(this._textures.has(id)) {
            console.warn("Id already in use. ");
        }

        this._textures.set(id, textureTask);
    }

    public getAssetContainerTaskData(id: string): AssetContainer {
        return this._containers.get(id)?.loadedContainer || new AssetContainer;
    }

    public getSoundTaskData(id: string): ArrayBuffer | undefined {
        return this._sounds.get(id)?.data;
    }

    public getTextureTaskData(id: string): Texture | undefined {
        return this._textures.get(id)?.texture; //  || new Texture(null);
    }

    public afterLoading(): void {
        this._assetsManager.onTasksDoneObservable.add((tasks) => {
            const errors = tasks.filter((task) => {
                return task.taskState === AssetTaskState.ERROR;
            });
            // const successes = tasks.filter(function (task) {
            //     return task.taskState !== AssetTaskState.ERROR;
            // });

            if (errors.length == 0) {
                this._allSuccessful = true;
                console.log("wowie");
                
            } else {
                // ToDo
            }
        });
    }

    public async loadAsync(): Promise<void> {
        await this._assetsManager.loadAsync();
    }

    public get allSuccessful(): boolean {
        return this._allSuccessful;
    }
}

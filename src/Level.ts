import type { Material } from "@babylonjs/core";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import "@babylonjs/core/Debug/debugLayer";
import { Engine } from "@babylonjs/core/Engines/engine";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/inspector";
import { assetLoadingException, unknownLevelMaterialException } from "./Exception";
import { LoadingManager } from "./LoadingManager";
import { createBackgroundMaterial, createUnlitMaterial } from "./MaterialFactory";
import { MaterialType, type LevelConfiguration, type LoaderTask } from "./types";

export class Level {
    private _name: string;
    private _renderArea: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;

    private _configuration: LevelConfiguration | null;

    private _loadingManager: LoadingManager;
    private _loaderTasks: Array<LoaderTask>;

    private _materials: Map<string, Material>

    // Does this need to be here? :)
    private _camera: ArcRotateCamera;

    private static defaultBackgroundColor = new Color4(.1, .1, .1, 1);
    private static defaultCameraTarget = new Vector3(0, 0, 0);
    private static defaultCameraRadiusMin = 0;
    private static defaultCameraRadiusMax = Number.MAX_VALUE;

    constructor(
        name: string,
        renderAreaId: string,
        configuration?: LevelConfiguration
    ) {
        this._name = name;
        this._renderArea = document.getElementById(renderAreaId) as HTMLCanvasElement;
        this._configuration = configuration ?? null;

        this._engine = new Engine(
            this._renderArea,
            true
        );
        this._scene = new Scene(this._engine);

        // Does this really belong here? Unfortunately with the current architecture this is bound to a level. 
        this._loadingManager = new LoadingManager(this._scene);

        if (this._configuration?.backgroundColor) {
            this.setSceneClearColor(this._configuration.backgroundColor);
        } else {
            this.setSceneClearColor(Level.defaultBackgroundColor);
        }

        // Is there any good way to error handle this?
        // For PBR materials: 
        let hdrTexture = CubeTexture.CreateFromPrefilteredData("/babylon_assets/environment.env", this._scene);
        hdrTexture.setReflectionTextureMatrix(Matrix.RotationY(0));
        this._scene.environmentTexture = hdrTexture;

        this._scene.imageProcessingConfiguration.exposure = 1;
        this._scene.imageProcessingConfiguration.toneMappingEnabled = true;
        this._scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;

        this._materials = new Map();

        // Extend later by allowing different kinds of cameras as specified in options. 
        this._camera = this.setupArcRotateCamera(this._configuration?.cameraTarget ?? Level.defaultCameraTarget);

        // That doesn't belong here obviously. 
        var light = new DirectionalLight("light1", new Vector3(0, -1, 0), this._scene);
        light.intensity = 4;

        if (configuration?.loaderTasks) {
            this.addLoaderTasks(configuration.loaderTasks);
        }
        this._loaderTasks = configuration?.loaderTasks || [];

        this.autoResize();
        this.runRenderLoop();
    }

    // This shold be inside of the actual loading  manager. 
    private addLoaderTasks(loaderTasks: Array<LoaderTask>) {
        for (let loaderTask of loaderTasks) {
            // Ugly hacky way to distinguish
            if ("url" in loaderTask) {
                this._loadingManager.addTextureTask(loaderTask.uId, loaderTask.url);
            } else {
                this._loadingManager.addContainerTask(
                    loaderTask.uId,
                    loaderTask.path,
                    loaderTask.filename
                );
            }
        }
    }

    public async init(): Promise<void> {
        await this._loadingManager.loadAsync();
        if (!this._loadingManager.allSuccessful) {
            throw assetLoadingException;
        } else {
            this.setupLevelMaterials();
            if (this._configuration?.createGround) {
                this.createGround(8, 1);
            }
        }
    }

    private setupLevelMaterials(): void {
        if (!this._configuration?.materials) {
            return;
        } else {
            for (let materialConfig of this._configuration.materials) {
                console.log("MATERIAL");
                console.log(materialConfig);
                let material;
                switch (materialConfig.type) {
                    case MaterialType.BackgroundMaterial:
                        material = createBackgroundMaterial(
                            materialConfig.uId, 
                            this._scene,
                            this._loadingManager.getTextureTaskData(materialConfig.textureId)
                        );
                        this._materials.set(materialConfig.uId, material);
                        break;
                    case MaterialType.UnlitMaterial:
                        material = createUnlitMaterial(
                            materialConfig.uId,
                            this._scene,
                            this._loadingManager.getTextureTaskData(materialConfig.textureId)
                        );
                        this._materials.set(materialConfig.uId, material);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    private createGround(size: number, visibility: number) {
        let ground = MeshBuilder.CreateGround("OBJ_Ground", { width: size, height: size }, this._scene);
        let material = this._materials.get("MAT_Ground");

        if(material) {
            ground.material = material;
        } else {
            throw unknownLevelMaterialException;
        }

        ground.visibility = visibility;
    }

    private autoResize(): void {
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    private runRenderLoop(): void {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    }

    public setSceneClearColor(color: Color4 | string) {
        if (typeof color == "string") {
            this._scene.clearColor = Color4.FromHexString(color);
        } else if (color) {
            this._scene.clearColor = color;
        } else {
            this._scene.clearColor = Level.defaultBackgroundColor;
        }
    }

    private setupArcRotateCamera(target?: Vector3): ArcRotateCamera {
        let camera = new ArcRotateCamera(
            this._name + "camera1",
            Math.PI / 2,
            Math.PI / 2,
            4,
            target || new Vector3(0, 0, 0),
            this._scene,
            true
        );
        camera.fov = 1; // Math.PI / 4;

        camera.minZ = 0.01;
        camera.maxZ = 100;

        camera.lowerRadiusLimit = this._configuration?.cameraRadiusMin ?? Level.defaultCameraRadiusMin;
        camera.upperRadiusLimit = this._configuration?.cameraRadiusMax ?? Level.defaultCameraRadiusMax;

        camera.upperBetaLimit = Math.PI / 2;

        camera.angularSensibilityX = 1250;
        camera.angularSensibilityY = 1250;

        camera.wheelPrecision = 100;
        camera.useNaturalPinchZoom = true;

        camera.inertia = .85;

        camera.attachControl(this._renderArea, true);
        return camera;
    }

    public loadModel(): void {

    }

    public debug(): void {
        this._scene.debugLayer.show({
            embedMode: true,
        });
    }

    public get scene(): Scene {
        return this._scene;
    }
}

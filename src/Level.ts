import { Animation } from "@babylonjs/core/Animations/animation";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import "@babylonjs/core/Debug/debugLayer";
import { Engine } from "@babylonjs/core/Engines/engine";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/inspector";
import { backgroundColor, createGround, CAM_RADIUS_MAX, CAM_RADIUS_MIN } from "./settingsSceneMain";
import { animationEasingFunction, animationFramerate } from "./settings";
import type { Polar3 } from "./types";

export class Level {
    private _name: string;
    private _renderArea: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;

    // Does this need to be here? :)
    private _camera: ArcRotateCamera;

    constructor(
        name: string,
        renderAreaId: string,
        options?: {
            cameraTarget?: Vector3
        }
    ) {
        this._name = name;
        this._renderArea = document.getElementById(renderAreaId) as HTMLCanvasElement;

        this._engine = new Engine(
            this._renderArea,
            true,
            undefined
        );
        this._scene = new Scene(this._engine);
        this._scene.clearColor = backgroundColor;

        // For PBR materials: 
        let hdrTexture = CubeTexture.CreateFromPrefilteredData("/babylon_assets/environment.env", this._scene);
        hdrTexture.setReflectionTextureMatrix(Matrix.RotationY(0));

        this._scene.environmentTexture = hdrTexture;

        this._scene.imageProcessingConfiguration.exposure = 1;
        this._scene.imageProcessingConfiguration.toneMappingEnabled = true;
        this._scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;

        // Extend later by allowing different kinds of cameras as specified in options. 
        this._camera = this.setupArcRotateCamera(options?.cameraTarget);


        var light = new DirectionalLight("light1", new Vector3(0, -1, 0), this._scene);
        light.intensity = 4;

        this.autoResize();
        this.runRenderLoop();

        if(createGround) {
            console.log("me should create ground");
            
        }
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

        camera.lowerRadiusLimit = CAM_RADIUS_MIN;
        camera.upperRadiusLimit = CAM_RADIUS_MAX;

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

    public restrictPolar3ToCameraLimits(
        positionPolar: Polar3,
        camera: ArcRotateCamera
    ): Polar3 {
        let longitude = positionPolar.longitude;
        let latitude = positionPolar.latitude;
        let radius = positionPolar.radius;

        if (camera.lowerRadiusLimit) {
            radius = radius > camera.lowerRadiusLimit ? radius : camera.lowerRadiusLimit;
        }
        if (camera.upperRadiusLimit) {
            radius = radius < camera.upperRadiusLimit ? radius : camera.upperRadiusLimit;
        }
        if (camera.lowerAlphaLimit) {
            longitude = longitude > camera.lowerAlphaLimit ? longitude : camera.lowerAlphaLimit;
        }
        if (camera.upperAlphaLimit) {
            longitude = longitude < camera.upperAlphaLimit ? longitude : camera.upperAlphaLimit;
        }
        if (camera.lowerBetaLimit) {
            latitude = latitude > camera.lowerBetaLimit ? latitude : camera.lowerBetaLimit;
        }
        if (camera.upperBetaLimit) {
            latitude = latitude < camera.upperBetaLimit ? latitude : camera.upperBetaLimit;
        }

        return { longitude, latitude, radius }
    }

    public updateCameraLimitsFromPolar3(
        camera: ArcRotateCamera, 
        positionPolar: Polar3
    ): void {
        let longitude = positionPolar.longitude;
        let latitude = positionPolar.latitude;
        let radius = positionPolar.radius;

        if(camera.lowerRadiusLimit) {
            camera.lowerRadiusLimit = camera.lowerRadiusLimit < radius ? camera.lowerRadiusLimit : radius;
        }
        if(camera.upperRadiusLimit) {
            camera.upperRadiusLimit = camera.upperRadiusLimit > radius ? camera.upperRadiusLimit : radius;
        }
        if(camera.lowerAlphaLimit) {
            camera.lowerAlphaLimit = camera.lowerAlphaLimit < longitude ? camera.lowerAlphaLimit : longitude;
        }
        if(camera.upperAlphaLimit) {
            camera.upperAlphaLimit = camera.upperAlphaLimit > longitude ? camera.upperAlphaLimit : longitude;
        }
        if(camera.lowerBetaLimit) {
            camera.lowerBetaLimit = camera.lowerBetaLimit < latitude ? camera.lowerBetaLimit : latitude;
        }
        if(camera.upperBetaLimit) {
            camera.upperBetaLimit = camera.upperBetaLimit > latitude ? camera.upperBetaLimit : latitude;
        }
    }

    public getClosestPolar3(positionPolar: Polar3, camera: ArcRotateCamera) {
        let alphaMod2Pi = camera.alpha % (2 * Math.PI);

        // The full rotations stored in the cameras alpha in radians €(-infinity, infinity)
        let fullRotations = camera.alpha >= 0 ? camera.alpha - alphaMod2Pi : camera.alpha + alphaMod2Pi;
        // Distance from the camera rotation to the target rotation. 
        let distance = Math.abs(positionPolar.longitude - alphaMod2Pi);
        // If the distance is bigger than pi, we must rotate the other direction to rotate on the shortest path: 
        let addend = (2 * Math.PI - positionPolar.longitude) * (distance >= Math.PI ? 1 : -1);

        let longitude = fullRotations + (distance < Math.PI ? positionPolar.longitude : addend);
        
        // Latitude and radius stay untouched
        let latitude = positionPolar.latitude;
        let radius = positionPolar.radius;

        return {longitude, latitude, radius};
    }

    public animateCameraToPosition(
        position: Vector3,
        options?: {
            callback?: () => void,
            updateLimits?: boolean
        }
    ): void {
        let positionPolar = this.cartesianToCameraPolar(position);

        if(options?.updateLimits) {
            this.updateCameraLimitsFromPolar3(this._camera, positionPolar);
        } else {
            positionPolar = this.restrictPolar3ToCameraLimits(positionPolar, this._camera);
        }

        positionPolar = this.getClosestPolar3(positionPolar, this._camera);
        this._camera.detachControl();

        this.animateCameraToAlpha(positionPolar.longitude);
        this.animateCameraToBeta(positionPolar.latitude);
        this.animateCameraToRadius(positionPolar.radius, () => {
            if(options?.callback) {
                options.callback();
            }
            this._camera?.attachControl();
        });
    }

    public animateCameraToAlpha(alpha: number, onEnded?: () => void): void {
        Animation.CreateAndStartAnimation(
            "alphaAnimation",
            this._camera,
            "alpha",
            animationFramerate,
            30,
            this._camera.alpha,
            alpha,
            Animation.ANIMATIONLOOPMODE_CONSTANT,
            animationEasingFunction,
            onEnded || undefined
        );
    }

    public animateCameraToBeta(beta: number, onEnded?: () => void): void {
        Animation.CreateAndStartAnimation(
            "betaAnimation",
            this._camera,
            "beta",
            animationFramerate,
            30,
            this._camera.beta,
            beta,
            Animation.ANIMATIONLOOPMODE_CONSTANT,
            animationEasingFunction,
            onEnded || undefined
        );
    }

    public animateCameraToRadius(radius: number, onEnded?: () => void): void {
        Animation.CreateAndStartAnimation(
            "radiusAnimation",
            this._camera,
            "radius",
            animationFramerate,
            30,
            this._camera.radius,
            radius,
            Animation.ANIMATIONLOOPMODE_CONSTANT,
            animationEasingFunction,
            onEnded || undefined
        );
    }

    public cartesianToCameraPolar(position: Vector3): Polar3 {
        let x = position.x;
        let y = position.y;
        let z = position.z;

        let radius = Math.sqrt(x * x + y * y + z * z);
        // The angle for longitude mesuring starts counterclockwise at the -x direction. 
        // Therefore if x is bigger or equal to zero the angle must be offset by half a rotation.
        let longitude = x >= 0 ? -Math.atan(z / -x) - Math.PI : Math.atan(z / -x);
        // We want the cameras up vector to point in the -z direction when at (0, x, 0) with 0 € [0, infinity);
        if (x == 0) {
            longitude = z >= 0 ? Math.PI / 2 : -Math.PI / 2;
        }
        let latitude = Math.acos(y / radius) || 0;

        return { longitude, latitude, radius };
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

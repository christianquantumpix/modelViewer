import { QuadraticEase } from "@babylonjs/core/Animations/easing";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MaterialType, type LevelConfiguration, type LevelMaterialTask, type LoaderTask } from "./types";

// Quality settings: 
export var tessellationCircle = 64;

// Animation settings: 
export var animationFramerate = 30;
export var animationDurationSeconds = 1;
export var animationEasingFunction = new QuadraticEase();
// Calls like this surprisingly are valid
animationEasingFunction.setEasingMode(QuadraticEase.EASINGMODE_EASEINOUT);

var levelPrimaryLoaderTasks: Array<LoaderTask> = [
    { uId: "OBJ_Test", path: "/babylon_assets/", filename: "OBJ_Test.glb" },
    { uId: "TEX_Ground", url: "/babylon_assets/TEX_Ground.png" },
    { uId: "TEX_Eye", url: "/babylon_assets/TEX_Eye.png" },
    { uId: "TEX_Eye_Hover", url: "/babylon_assets/TEX_Eye_Hover.png" }
];

var levelPrimaryMaterials: Array<LevelMaterialTask> = [
    { uId: "MAT_Ground", textureId: "TEX_Ground", type: MaterialType.BackgroundMaterial}
]

var levelSecondaryLoaderTasks: Array<LoaderTask> = [
    { uId: "TEX_Ground", url: "/babylon_assets/TEX_Ground.png" },
    { uId: "TEX_Eye", url: "/babylon_assets/TEX_Eye.png" },
    { uId: "TEX_Eye_Hover", url: "/babylon_assets/TEX_Eye_Hover.png" }
];

var levelSecondaryMaterials: Array<LevelMaterialTask> = [
    { uId: "MAT_Ground", textureId: "TEX_Ground", type: MaterialType.BackgroundMaterial}
]

export var levelPrimarySettings: LevelConfiguration = {
    backgroundColor: "#000028",
    createGround: true,
    groundVisibility: 1,
    buttonDistanceVisible: 6,
    buttonDistanceFullyVisible: 4,
    cameraTarget: new Vector3(0, .5, 0),
    cameraRadiusMin: 3.5,
    cameraRadiusMax: 7,
    loaderTasks: levelPrimaryLoaderTasks,
    materials: levelPrimaryMaterials
}

export var levelSecondarySettings: LevelConfiguration = {
    backgroundColor: "#000028",
    createGround: true,
    groundVisibility: 1,
    buttonDistanceVisible: 6,
    buttonDistanceFullyVisible: 4,
    cameraTarget: new Vector3(0, .5, 0),
    cameraRadiusMin: 3.5,
    cameraRadiusMax: 7,
    loaderTasks: levelSecondaryLoaderTasks,
    materials: levelSecondaryMaterials
}

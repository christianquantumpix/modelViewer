import type { BackgroundMaterial, PBRMaterial, StandardMaterial } from "@babylonjs/core";
import type { Color4 } from "@babylonjs/core/Maths/math.color";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";

export type Polar3 = {
    longitude: number,
    latitude: number,
    radius: number
}

export type LevelConfiguration = {
    backgroundColor: Color4 | string,
    createGround: boolean,
    groundVisibility: number,
    buttonDistanceVisible: number,
    buttonDistanceFullyVisible: number,
    cameraTarget: Vector3,
    cameraRadiusMin: number,
    cameraRadiusMax: number,
    loaderTasks: Array<LoaderTask>,
    materials: Array<LevelMaterialTask>
}

export type ContainerTask = {
    uId: string, 
    path: string, 
    filename: string
}

export type TextureTask = {
    uId: string,
    url: string
}

export type LoaderTask = ContainerTask | TextureTask;

export enum MaterialType {
    BackgroundMaterial,
    UnlitMaterial,
    ColorMaterial
}

export type LevelMaterialTask = {
    uId: string, 
    textureId: string, 
    type: MaterialType
}

export type LevelMaterial = BackgroundMaterial | StandardMaterial | PBRMaterial;

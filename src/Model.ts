
import type { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AssetContainer } from "@babylonjs/core/assetContainer";
import type { Scene } from "@babylonjs/core/scene";

export class Model {
    private _name: string;
    private _scene: Scene;
    private _model: AssetContainer;
    private _cameraPositions: Array<Vector3>;

    constructor(name: string, scene: Scene, model: AssetContainer) {
        this._name = name;
        this._scene = scene;
        this._model = model;

        this._cameraPositions = [];

        this.init();
    }

    private init(): void {
        for(let camera of this._model.cameras) {
            if(camera.parent) {
                let parent = camera.parent as TransformNode;
                this._cameraPositions.push(parent.position);
            } else {
                this._cameraPositions.push(camera.position);
            }
            
            // camera.dispose();
        }
        // this._model.cameras = [];

        for(let light of this._model.lights) {
            light.intensity /= 100;
        }
        for(let mesh of this._model.meshes) {
            if(mesh.material) {
                let material = mesh.material as PBRMaterial;
                material.enableSpecularAntiAliasing = true;
                if(material.clearCoat) {
                    // console.log("wowie woohwah");
                    // console.log(material.clearCoat);
                    
                    
                }
            }
        }

        this._model.addAllToScene();
    }

    public get cameraPositions(): Array<Vector3> {
        return this._cameraPositions;
    }
}

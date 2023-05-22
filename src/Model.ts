
import type { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AssetContainer } from "@babylonjs/core/assetContainer";
import type { Scene } from "@babylonjs/core/scene";
import { valueEqual } from "./mathFunctions";

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
            // this._cameraPositions.push(camera.globalPosition);
            console.log(camera.name);
            


            if(camera.parent) {
                console.log("fucksht parent");
                
                let parent = camera.parent as TransformNode;
                this._cameraPositions.push(parent.position);
            } else {
                console.log("ndfjh");
                
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

                if(material.emissiveIntensity > 0 && !valueEqual(material.emissiveColor, Color3.BlackReadOnly)) {
                    console.log(material.emissiveColor);
                    console.log(material.emissiveIntensity);
                    
                    console.log("Emissive material detected: " + material.name);
                    
                    
                }
            }
        }

        this._model.addAllToScene();
    }

    public get cameraPositions(): Array<Vector3> {
        return this._cameraPositions;
    }
}

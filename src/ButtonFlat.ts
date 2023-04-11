
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import type { Material } from "@babylonjs/core/Materials/material";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import { distanceVisible, distanceFullyVisible } from "./sceneSettings";

export class ButtonFlat {
    private _name: string;
    private _scene: Scene;
    
    private _meshBase: Mesh;

    private _material: Material;
    private _materialHover: Material;

    constructor(
        name: string,
        scene: Scene,
        size: number,
        position: Vector3,
        material: Material,
        materialHover: Material
    ) {
        this._name = name;
        this._scene = scene;

        this._material = material;
        this._materialHover = materialHover;

        this._meshBase = MeshBuilder.CreateDisc(this._name, {radius: size, tessellation: 64});
        this._meshBase.position = position;

        this._meshBase.billboardMode = Mesh.BILLBOARDMODE_ALL;

        this._meshBase.material = this._material;
        this.distanceVisibility();
        this.registerDefaultHoverActions();
    }

    private distanceVisibility() {
        if(!this._scene.activeCamera) {
            return;
        }

        let difference = distanceVisible - distanceFullyVisible; 

        this._scene.activeCamera.onViewMatrixChangedObservable.add(() => {
            if(!this._scene._activeCamera) {
                return;
            }
            let distance = this._scene._activeCamera.position.subtract(this._meshBase.position).length();
            let output = (distance - distanceFullyVisible) / (distanceVisible - distanceFullyVisible)
            this._meshBase.visibility = 1 - output;

            // console.log(distance);
            // console.log(this._meshBase.visibility);
            
            
        });

    }

    private registerDefaultHoverActions(): void {
        this._meshBase.actionManager = this._meshBase.actionManager || new ActionManager();
        this._meshBase.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnPointerOverTrigger,
                () => {
                    console.log("such wowie");
                    // fadeIn(this._meshHover, .1);
                    this._meshBase.material = this._materialHover;
                }
            )
        );
        this._meshBase.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnPointerOutTrigger,
                () => {
                    console.log("such wowie");
                    // fadeOut(this._meshHover, .1);
                    this._meshBase.material = this._material;
                }
            )
        );
    }
}


import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import type { Material } from "@babylonjs/core/Materials/material";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import { distanceVisible, distanceFullyVisible } from "./settingsSceneMain";
import { smoothstep } from "./mathFunctions";

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

        this.activateDistanceVisibility();
        this.registerDefaultHoverActions();
    }

    private activateDistanceVisibility(): void {
        if(!this._scene.activeCamera) {
            console.log("no active camera found");
            
            return;
        }

        this._scene.activeCamera.onViewMatrixChangedObservable.add(() => {
            this.distanceVisibility();
        });
    } 

    private distanceVisibility(): void {
        if(!this._scene._activeCamera) {
            return;
        }
        let distance = this._scene._activeCamera.position.subtract(this._meshBase.position).length();
        let output = Math.min(
            Math.max(
                (distance - distanceFullyVisible) / (distanceVisible - distanceFullyVisible), 
                0
            ), 
            1
        );
        this._meshBase.visibility = smoothstep(1 - output);
        if(this._meshBase.visibility == 0) {
            this._meshBase.setEnabled(false);
        } else {
            this._meshBase.setEnabled(true);
        }
    }

    private registerDefaultHoverActions(): void {
        this._meshBase.actionManager = this._meshBase.actionManager || new ActionManager();
        this._meshBase.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnPointerOverTrigger,
                () => {
                    this._meshBase.visibility = 1;
                    this._meshBase.material = this._materialHover;
                }
            )
        );
        this._meshBase.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnPointerOutTrigger,
                () => {
                    this.distanceVisibility();
                    this._meshBase.material = this._material;
                }
            )
        );
    }
}

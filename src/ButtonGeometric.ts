
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import type { Material } from "@babylonjs/core/Materials/material";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import { fadeIn, fadeOut } from "./AnimationManager";
import type { AssetContainer } from "@babylonjs/core/assetContainer";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";


export class ButtonGeometric {
    private _name: string;
    private _scene: Scene;
    private _model: AssetContainer;
    private _root: TransformNode;

    private _meshBase: Mesh;
    private _meshHover: Mesh;

    constructor(
        name: string,
        scene: Scene,
        model: AssetContainer,
        size: number,
        position: Vector3,
        material: PBRMaterial,
        materialHover: PBRMaterial
    ) {
        this._name = name;
        this._scene = scene;

        this._model = model;
        console.log(model);
        

        this._root = model.meshes[0];
        this._root.name = this._name;
        this._root.scaling.scaleInPlace(size);

        this._root.position = position;

        this._meshBase = new Mesh(name + "Base");
        this._meshHover = new Mesh(name + "Hover");

        for(let mesh of model.meshes) {
            if(mesh.name.includes("_Base")) {
                console.log("base found");
                
                this._meshBase.dispose();
                this._meshBase = mesh as Mesh;
            }
            if(mesh.name.includes("_Hover")) {
                this._meshHover.dispose();
                this._meshHover = mesh as Mesh;
            }
        }

        
        this._meshBase.material = material;
        this._meshHover.material = materialHover;

        console.log(this._meshBase.material);
        
        // this._meshBase.billboardMode = Mesh.BILLBOARDMODE_ALL;
        // this._meshHover.billboardMode = Mesh.BILLBOARDMODE_ALL;
        this._root.rotationQuaternion = null;
        // this._root.rotate(new Vector3(0, 1, 0), Math.PI);
        this._root.billboardMode = Mesh.BILLBOARDMODE_ALL;

        this._meshHover.isPickable = false;
        this._meshHover.visibility = 0;

        this.registerDefaultHoverActions();

        model.addAllToScene();
    }

    registerDefaultHoverActions(): void {
        this._meshBase.actionManager = this._meshBase.actionManager || new ActionManager();
        this._meshBase.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnPointerOverTrigger,
                () => {
                    console.log("such wowie");
                    fadeIn(this._meshHover, .1);
                }
            )
        );
        this._meshBase.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnPointerOutTrigger,
                () => {
                    console.log("such wowie");
                    fadeOut(this._meshHover, .1);
                }
            )
        );
    }
}

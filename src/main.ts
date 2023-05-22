import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import './app.css';
import App from './App.svelte';
import { Level } from './Level';
import { LoadingManager } from './LoadingManager';
import { Model } from './Model';
import { createBackgroundMaterial, createColorMaterial, createUnlitMaterial } from './MaterialFactory';
import { ButtonFlat } from './ButtonFlat';
import { ButtonGeometric } from './ButtonGeometric';
import { Color3, MeshBuilder } from '@babylonjs/core';
import { createGround, groundVisibility } from './settingsSceneMain';

const app = new App({
    target: document.getElementById('app'),
});

export default app

window.addEventListener('load', async () => {
    let mainLevel = new Level("mainLevel", "renderArea", { cameraTarget: new Vector3(0, .5, 0) });

    let loadingManager = new LoadingManager();
    loadingManager.addContainerTask("OBJ_Model", "/babylon_assets/", "OBJ_Geilomat.glb");
    loadingManager.addTextureTask("TEX_Ground", "/babylon_assets/TEX_Ground.png");
    loadingManager.addTextureTask("TEX_Eye", "/babylon_assets/TEX_Eye.png");
    loadingManager.addTextureTask("TEX_Eye_Hover", "/babylon_assets/TEX_Eye_Hover.png");

    await loadingManager.loadAsync();
    if (loadingManager.allSuccessful) {

        let container = loadingManager.getAssetContainerTaskData("OBJ_Model");

        if (container) {
            let model = new Model("mainModel", mainLevel.scene, container);

            console.log(model.cameraPositions);

            setTimeout(() => {
                mainLevel.animateCameraToPosition(model.cameraPositions[0], { updateLimits: true });
            }, 5000);
        }

        let materialGround = createBackgroundMaterial("MAT_Ground", loadingManager.getTextureTaskData("TEX_Ground"));
        let materialEye = createUnlitMaterial("MAT_Camera", loadingManager.getTextureTaskData("TEX_Eye"));
        let materialEyeHover = createUnlitMaterial("MAT_Button_Eye_Hover", loadingManager.getTextureTaskData("TEX_Eye_Hover"));

        let button = new ButtonFlat(
            "buttonEye", 
            mainLevel.scene, 
            .1,
            new Vector3(0, 1.5, 0),
            materialEye,
            materialEyeHover
        );
        // let button2 = new ButtonGeometric(
        //     "buttonEye", 
        //     mainLevel.scene, 
        //     loadingManager.getAssetContainerTaskData("OBJ_Button_Basic"),
        //     .1,
        //     new Vector3(0, 1.2, 0),
        //     materialEye,
        //     materialEyeHover
        // );
        mainLevel.debug();

        if(createGround) {
            let ground = MeshBuilder.CreateGround("OBJ_Ground", {width: 8, height: 8}); 
            ground.material = materialGround;
            ground.visibility = groundVisibility;
        }
    }
});

import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import App from './App.svelte';
import { ButtonFlat } from './ButtonFlat';
import { Level } from './Level';
import { LoadingManager } from './LoadingManager';
import { createUnlitMaterial } from './MaterialFactory';
import { Model } from './Model';
import './app.css';
import { levelPrimarySettings, levelSecondarySettings } from './settings';

const app = new App({
    target: document.getElementById('app'),
});

export default app

window.addEventListener('load', async () => {
    await loadContent();
});

// Assets, Content, Ressources?
async function loadContent() {
    // For some super obscure reason the babylon asset loading system needs an existing babylon scene 
    // to load assets properly. So level instantiation needs to happen here. 
    let levelPrimary = new Level("levelPrimary", "renderAreaModal", levelPrimarySettings);
    let levelSecondary = new Level("levelSecondary", "renderArea", levelSecondarySettings);
    await levelPrimary.init()
    await levelSecondary.init()
    
    let loadingManagerPrimary = new LoadingManager(levelPrimary.scene);
    loadingManagerPrimary.addContainerTask("OBJ_Test", "/babylon_assets/", "OBJ_Test.glb");

    await loadingManagerPrimary.loadAsync();
    
    if (loadingManagerPrimary.allSuccessful) {
        console.log("loading worked");
        
        populateLevelPrimary(loadingManagerPrimary, levelPrimary);
    }

    let loadingManagerSecondary = new LoadingManager(levelSecondary.scene);

    loadingManagerSecondary.addTextureTask("TEX_Ground", "/babylon_assets/TEX_Ground.png");
    loadingManagerSecondary.addTextureTask("TEX_Eye", "/babylon_assets/TEX_Eye.png");
    loadingManagerSecondary.addTextureTask("TEX_Eye_Hover", "/babylon_assets/TEX_Eye_Hover.png");

    await loadingManagerSecondary.loadAsync();

    if(loadingManagerSecondary.allSuccessful) {
        console.log("Loadin of secondary assets also worked");
        populateLevelSecondary(loadingManagerSecondary, levelSecondary);
    }
}

function populateLevelPrimary(loadingManager: LoadingManager, levelPrimary: Level) {
    let container = loadingManager.getAssetContainerTaskData("OBJ_Test");
    if (container) {
        let model = new Model("mainModel", levelPrimary.scene, container);

        console.log(model.cameraPositions);

        setTimeout(() => {
            // levelPrimary.animateCameraToPosition(model.cameraPositions[0], { updateLimits: true });
        }, 5000);
    }

    // let button2 = new ButtonGeometric(
        //     "buttonEye", 
        //     mainLevel.scene, 
        //     loadingManager.getAssetContainerTaskData("OBJ_Button_Basic"),
        //     .1,
        //     new Vector3(0, 1.2, 0),
        //     materialEye,
        //     materialEyeHover
        // );
    levelPrimary.debug();
}

function populateLevelSecondary(loadingManager: LoadingManager, levelSecondary: Level) {
    let materialEye = createUnlitMaterial("MAT_Button_Eye", levelSecondary.scene, loadingManager.getTextureTaskData("TEX_Eye"));
    let materialEyeHover = createUnlitMaterial("MAT_Button_Eye_Hover", levelSecondary.scene, loadingManager.getTextureTaskData("TEX_Eye_Hover"));
    
    let button = new ButtonFlat(
        "buttonEye", 
        levelSecondary.scene, 
        .1,
        new Vector3(0, 1.5, 0),
        materialEye,
        materialEyeHover,
        7,
        3.5
    );
}

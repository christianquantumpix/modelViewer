import { BackgroundMaterial } from "@babylonjs/core/Materials/Background/backgroundMaterial";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import type { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Color3 } from "@babylonjs/core/Maths/math.color";

export function createColorMaterial(name: string, color: Color3): PBRMaterial {
    // let buttonMaterial = new BackgroundMaterial(name);
    let colorMaterial = new PBRMaterial(name);

    colorMaterial.albedoColor = color;
    colorMaterial.emissiveColor = color;
    colorMaterial.disableLighting = true;
    
    return colorMaterial;
}

export function createUnlitMaterial(name: string, texture: Texture | undefined): StandardMaterial {
    // let buttonMaterial = new BackgroundMaterial(name);
    let unlitMaterial = new StandardMaterial(name);

    if(!texture) {
        console.warn("something went wrong!");
        return unlitMaterial;
        
    }
    unlitMaterial.diffuseTexture = texture;
    // buttonMaterial.albedoColor = Color3.BlackReadOnly;
    unlitMaterial.emissiveTexture = texture;
    unlitMaterial.diffuseTexture.hasAlpha = true;
    unlitMaterial.useAlphaFromDiffuseTexture = true;
    unlitMaterial.disableLighting = true;
    
    return unlitMaterial;
}

export function createBackgroundMaterial(name: string, texture: Texture | undefined): BackgroundMaterial {
    let backgroundMaterial = new BackgroundMaterial(name);

    if(!texture) {
        console.warn("something went wrong!");
        return backgroundMaterial;
    }

    backgroundMaterial.diffuseTexture = texture;
    backgroundMaterial.diffuseTexture.hasAlpha = true;

    return backgroundMaterial;
}
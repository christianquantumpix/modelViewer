import { Animation } from "@babylonjs/core/Animations/animation";
import { animationEasingFunction, animationFramerate } from "./settings";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export function fadeIn(mesh: AbstractMesh, durationS?: number, onEnded?: () => void): void {
    let duration = typeof durationS != "undefined" ? durationS * animationFramerate : animationFramerate;

    Animation.CreateAndStartAnimation(
        "alphaAnimation",
        mesh,
        "visibility",
        animationFramerate,
        duration, 
        mesh.visibility,
        1,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        undefined, // animationEasingFunction,
        onEnded || undefined
    );
}

export function fadeOut(mesh: AbstractMesh, durationS?: number, onEnded?: () => void): void {
    let duration = typeof durationS != "undefined" ? durationS * animationFramerate : animationFramerate;

    Animation.CreateAndStartAnimation(
        "alphaAnimation",
        mesh,
        "visibility",
        animationFramerate,
        duration,
        mesh.visibility,
        0,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        undefined, // animationEasingFunction,
        onEnded || undefined
    );
}

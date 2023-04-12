import { Animation } from "@babylonjs/core/Animations/animation";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { animationEasingFunction, animationFramerate } from "./settings";
import type { Polar3 } from "./types";
import type { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";

export function restrictPolar3ToCameraLimits(
    positionPolar: Polar3,
    camera: ArcRotateCamera
): Polar3 {
    let longitude = positionPolar.longitude;
    let latitude = positionPolar.latitude;
    let radius = positionPolar.radius;

    if (camera.lowerRadiusLimit) {
        radius = radius > camera.lowerRadiusLimit ? radius : camera.lowerRadiusLimit;
    }
    if (camera.upperRadiusLimit) {
        radius = radius < camera.upperRadiusLimit ? radius : camera.upperRadiusLimit;
    }
    if (camera.lowerAlphaLimit) {
        longitude = longitude > camera.lowerAlphaLimit ? longitude : camera.lowerAlphaLimit;
    }
    if (camera.upperAlphaLimit) {
        longitude = longitude < camera.upperAlphaLimit ? longitude : camera.upperAlphaLimit;
    }
    if (camera.lowerBetaLimit) {
        latitude = latitude > camera.lowerBetaLimit ? latitude : camera.lowerBetaLimit;
    }
    if (camera.upperBetaLimit) {
        latitude = latitude < camera.upperBetaLimit ? latitude : camera.upperBetaLimit;
    }

    return { longitude, latitude, radius }
}

export function updateCameraLimitsFromPolar3(
    camera: ArcRotateCamera, 
    positionPolar: Polar3
): void {
    let longitude = positionPolar.longitude;
    let latitude = positionPolar.latitude;
    let radius = positionPolar.radius;

    if(camera.lowerRadiusLimit) {
        camera.lowerRadiusLimit = camera.lowerRadiusLimit < radius ? camera.lowerRadiusLimit : radius;
    }
    if(camera.upperRadiusLimit) {
        camera.upperRadiusLimit = camera.upperRadiusLimit > radius ? camera.upperRadiusLimit : radius;
    }
    if(camera.lowerAlphaLimit) {
        camera.lowerAlphaLimit = camera.lowerAlphaLimit < longitude ? camera.lowerAlphaLimit : longitude;
    }
    if(camera.upperAlphaLimit) {
        camera.upperAlphaLimit = camera.upperAlphaLimit > longitude ? camera.upperAlphaLimit : longitude;
    }
    if(camera.lowerBetaLimit) {
        camera.lowerBetaLimit = camera.lowerBetaLimit < latitude ? camera.lowerBetaLimit : latitude;
    }
    if(camera.upperBetaLimit) {
        camera.upperBetaLimit = camera.upperBetaLimit > latitude ? camera.upperBetaLimit : latitude;
    }
}

export function getClosestPolar3(positionPolar: Polar3, camera: ArcRotateCamera) {
    let alphaMod2Pi = camera.alpha % (2 * Math.PI);

    // The full rotations stored in the cameras alpha in radians €(-infinity, infinity)
    let fullRotations = camera.alpha >= 0 ? camera.alpha - alphaMod2Pi : camera.alpha + alphaMod2Pi;
    // Distance from the camera rotation to the target rotation. 
    let distance = Math.abs(positionPolar.longitude - alphaMod2Pi);
    // If the distance is bigger than pi, we must rotate the other direction to rotate on the shortest path: 
    let addend = (2 * Math.PI - positionPolar.longitude) * (distance >= Math.PI ? 1 : -1);

    let longitude = fullRotations + (distance < Math.PI ? positionPolar.longitude : addend);
    
    // Latitude and radius stay untouched
    let latitude = positionPolar.latitude;
    let radius = positionPolar.radius;

    return {longitude, latitude, radius};
}

export function animateCameraToPosition(
    camera: ArcRotateCamera,
    position: Vector3,
    options?: {
        callback?: () => void,
        updateLimits?: boolean
    }
): void {
    let positionPolar = cartesianToCameraPolar(position);

    if(options?.updateLimits) {
        updateCameraLimitsFromPolar3(camera, positionPolar);
    } else {
        positionPolar = restrictPolar3ToCameraLimits(positionPolar, camera);
    }

    positionPolar = getClosestPolar3(positionPolar, camera);
    camera.detachControl();

    animateCameraToAlpha(camera, positionPolar.longitude);
    animateCameraToBeta(camera, positionPolar.latitude);
    animateCameraToRadius(camera, positionPolar.radius, () => {
        if(options?.callback) {
            options.callback();
        }
        camera.attachControl();
    });
}

export function animateCameraToAlpha(
    camera: ArcRotateCamera,
    alpha: number, 
    onEnded?: () => void
): void {
    Animation.CreateAndStartAnimation(
        "alphaAnimation",
        camera,
        "alpha",
        animationFramerate,
        30,
        camera.alpha,
        alpha,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        animationEasingFunction,
        onEnded || undefined
    );
}

export function animateCameraToBeta(
    camera: ArcRotateCamera,
    beta: number, 
    onEnded?: () => void
): void {
    Animation.CreateAndStartAnimation(
        "betaAnimation",
        camera,
        "beta",
        animationFramerate,
        30,
        camera.beta,
        beta,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        animationEasingFunction,
        onEnded || undefined
    );
}

export function animateCameraToRadius(
    camera: ArcRotateCamera,
    radius: number, 
    onEnded?: () => void
): void {
    Animation.CreateAndStartAnimation(
        "radiusAnimation",
        camera,
        "radius",
        animationFramerate,
        30,
        camera.radius,
        radius,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        animationEasingFunction,
        onEnded || undefined
    );
}

export function cartesianToCameraPolar(position: Vector3): Polar3 {
    let x = position.x;
    let y = position.y;
    let z = position.z;

    let radius = Math.sqrt(x * x + y * y + z * z);
    // The angle for longitude mesuring starts counterclockwise at the -x direction. 
    // Therefore if x is bigger or equal to zero the angle must be offset by half a rotation.
    let longitude = x >= 0 ? -Math.atan(z / -x) - Math.PI : Math.atan(z / -x);
    // We want the cameras up vector to point in the -z direction when at (0, x, 0) with 0 € [0, infinity);
    if (x == 0) {
        longitude = z >= 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    let latitude = Math.acos(y / radius) || 0;

    return { longitude, latitude, radius };
}

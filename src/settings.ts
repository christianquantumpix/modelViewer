import { CubicEase, QuadraticEase } from "@babylonjs/core/Animations/easing"

export var animationFramerate = 30;
export var animationDurationSeconds = 1;
export var animationEasingFunction = new QuadraticEase();
animationEasingFunction.setEasingMode(CubicEase.EASINGMODE_EASEINOUT);
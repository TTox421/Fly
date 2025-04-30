import * as alt from 'alt-client';
import * as native from 'natives';
import { CameraSystem } from './camera/index.js';
import Screen from './screen/index.js';
var KeyboardShortcuts;
(function(KeyboardShortcuts) {
    KeyboardShortcuts["w"] = "87";
    KeyboardShortcuts["d"] = "68";
    KeyboardShortcuts["s"] = "83";
    KeyboardShortcuts["a"] = "65";
    KeyboardShortcuts["wd"] = "8768";
    KeyboardShortcuts["wdshift"] = "876816";
    KeyboardShortcuts["wa"] = "8765";
    KeyboardShortcuts["washift"] = "876516";
    KeyboardShortcuts["sd"] = "8368";
    KeyboardShortcuts["sdshift"] = "836816";
    KeyboardShortcuts["sa"] = "8365";
    KeyboardShortcuts["sashift"] = "836516";
    KeyboardShortcuts["wshift"] = "8716";
    KeyboardShortcuts["dshift"] = "6816";
    KeyboardShortcuts["sshift"] = "8316";
    KeyboardShortcuts["ashift"] = "6516";
})(KeyboardShortcuts || (KeyboardShortcuts = {}));
var Keyboard;
(function(Keyboard) {
    Keyboard["w"] = "87";
    Keyboard["d"] = "68";
    Keyboard["s"] = "83";
    Keyboard["a"] = "65";
    Keyboard["shift"] = "16";
})(Keyboard || (Keyboard = {}));
class Fly {
    static _bind = 88;
    static active = false;
    static bindActive = false;
    static block = false;
    // private static keyActive = new Map();
    static keysActive = new Array();
    static get bind() {
        return Fly._bind;
    }
    static setBlock(toggle) {
        return this.block = toggle;
    }
    static getBlock() {
        return this.block;
    }
    static async on() {
        alt.toggleGameControls(false);
        CameraSystem.createCamera('fly', 'DEFAULT_SCRIPTED_CAMERA', alt.Player.local.pos, native.getGameplayCamRot(2), 50);
        CameraSystem.setCamera('fly');
        this.active = true;
        alt.emitServer('fly:active', true, {
            x: alt.Player.local.pos.x,
            y: alt.Player.local.pos.y,
            z: alt.Player.local.pos.z
        });
        this.teleportLink = setInterval(async ()=>{
            let pos = await CameraSystem._cameras.get('fly').getCamPos();
            alt.emitServer('fly:active', true, pos);
        }, 500);
        alt.setCursorPos(Screen.getMiddleScreenResolution());
        let cursorPos = alt.getCursorPos(false);
        let difference;
        let focusGame = true;
        this.objectLink = setInterval(async ()=>{
            if (!alt.isGameFocused() || alt.isConsoleOpen()) {
                focusGame = false;
                return;
            }
            if (!focusGame) {
                focusGame = true;
                alt.setCursorPos(Screen.getMiddleScreenResolution());
                cursorPos = alt.getCursorPos(false);
            }
            difference = {
                x: cursorPos.x - alt.getCursorPos(false).x,
                y: cursorPos.y - alt.getCursorPos(false).y
            };
            if (difference.x === 0 && difference.y === 0) return;
            if (difference.x > 0) {
                difference.x = 180 * difference.x / 100;
                if (difference.x > 2) difference.x = difference.x * 0.03;
                else difference.x = difference.x * 0.04;
            } else if (difference.x < 0) {
                difference.x = 180 * difference.x / 100;
                if (difference.x < -2) difference.x = difference.x * 0.03;
                else difference.x = difference.x * 0.04;
            }
            if (difference.y > 0) {
                difference.y = 180 * difference.y / 100;
                if (difference.y > 2) difference.y = difference.y * 0.03;
                else difference.y = difference.y * 0.04;
            } else if (difference.y < 0) {
                difference.y = 180 * difference.y / 100;
                if (difference.y < -2) difference.y = difference.y * 0.03;
                else difference.y = difference.y * 0.04;
            }
            const rot = native.getCamRot(CameraSystem._cameras.get('fly').getCam(), 0);
            const camX = rot.z;
            const camY = rot.x;
            if (camY + difference.y > 90) difference.y = 90 - camY;
            if (camY + difference.y < -90) difference.y = -90 - camY;
            if (camY >= 90) {
                if (difference.y > 0) CameraSystem._cameras.get('fly').setCamRot({
                    x: 90,
                    y: 0,
                    z: camX + difference.x
                });
                else CameraSystem._cameras.get('fly').setCamRot({
                    x: camY + difference.y,
                    y: 0,
                    z: camX + difference.x
                });
            } else if (camY <= -90) {
                if (difference.y < 0) CameraSystem._cameras.get('fly').setCamRot({
                    x: -90,
                    y: 0,
                    z: camX + difference.x
                });
                else CameraSystem._cameras.get('fly').setCamRot({
                    x: camY + difference.y,
                    y: 0,
                    z: camX + difference.x
                });
            } else {
                CameraSystem._cameras.get('fly').setCamRot({
                    x: camY + difference.y,
                    y: 0,
                    z: camX + difference.x
                });
            }
            alt.setCursorPos(cursorPos);
        }, 5);
    }
    static async off() {
        if (this.active) {
            Fly.keysActive = new Array();
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            if (this.objectLink) {
                clearInterval(this.objectLink);
                this.objectLink = null;
            }
            if (this.teleportLink) clearInterval(this.teleportLink);
            alt.toggleGameControls(true);
            let camPos = await CameraSystem._cameras.get('fly').getCamPos();
            let result = await Promise.resolve(native.getGroundZFor3dCoord(camPos.x, camPos.y, camPos.z, 0, false, false));
            alt.emitServer('fly:active', false, {
                x: camPos.x,
                y: camPos.y,
                z: result[1]
            });
            this.active = false;
            this.teleportLink = null;
            CameraSystem.destroyAllCameras();
        }
    }
    /**
     * Комбинации
     * @param w - 87
     * @param d - 68
     * @param s - 83
     * @param a - 65
     * @param shift - 16
     * @param w-d - 8768 | @param w-d-shift - 876816 | @param w-a - 8765 | @param w-a-shift - 876516
     * @param s-d - 8368 | @param s-d-shift - 836816 | @param s-a - 8365 | @param s-a-shift - 836516
     * @param w-shift - 8716 | @param d-shift - 6816 | @param s-shift - 8316 | @param a-shift - 6516
     */ static keyDown(key) {
        if (alt.isConsoleOpen() || !alt.isGameFocused) return;
        if (!(key + "" === Keyboard.w || key + "" === Keyboard.d || key + "" === Keyboard.s || key + "" === Keyboard.a || key + "" === Keyboard.shift)) return;
        let keystring = "";
        for (let keyActiv of this.keysActive){
            keystring = keystring + JSON.stringify(keyActiv);
        }
        if (keystring === keystring + key) return;
        Fly.keysActive.push(key);
        keystring = keystring + JSON.stringify(key);
        if (keystring === Keyboard.w) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(0, 0.3);
            }, 0);
        } else if (keystring === Keyboard.d) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-90, 0.3);
            }, 0);
        } else if (keystring === Keyboard.s) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(180, 0.3);
            }, 0);
        } else if (keystring === Keyboard.a) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(90, 0.3);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.shift || keystring === Keyboard.shift + Keyboard.w) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(0, 2);
            }, 0);
        } else if (keystring === Keyboard.d + Keyboard.shift || keystring === Keyboard.shift + Keyboard.d) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-90, 2);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.shift || keystring === Keyboard.shift + Keyboard.s) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(180, 2);
            }, 0);
        } else if (keystring === Keyboard.a + Keyboard.shift || keystring === Keyboard.shift + Keyboard.a) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(90, 2);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.d || keystring === Keyboard.d + Keyboard.w) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-45, 0.3);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.a || keystring === Keyboard.a + Keyboard.w) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(45, 0.3);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.d || keystring === Keyboard.d + Keyboard.s) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-135, 0.3);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.a || keystring === Keyboard.a + Keyboard.s) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(135, 0.3);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.d + Keyboard.shift || keystring === Keyboard.w + Keyboard.shift + Keyboard.d || keystring === Keyboard.d + Keyboard.w + Keyboard.shift || keystring === Keyboard.d + Keyboard.shift + Keyboard.w || keystring === Keyboard.shift + Keyboard.d + Keyboard.w || keystring === Keyboard.shift + Keyboard.w + Keyboard.d) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-45, 2);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.a + Keyboard.shift || keystring === Keyboard.w + Keyboard.shift + Keyboard.a || keystring === Keyboard.a + Keyboard.w + Keyboard.shift || keystring === Keyboard.a + Keyboard.shift + Keyboard.w || keystring === Keyboard.shift + Keyboard.a + Keyboard.w || keystring === Keyboard.shift + Keyboard.w + Keyboard.a) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(45, 2);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.d + Keyboard.shift || keystring === Keyboard.s + Keyboard.shift + Keyboard.d || keystring === Keyboard.d + Keyboard.s + Keyboard.shift || keystring === Keyboard.d + Keyboard.shift + Keyboard.s || keystring === Keyboard.shift + Keyboard.d + Keyboard.s || keystring === Keyboard.shift + Keyboard.s + Keyboard.d) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-135, 2);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.a + Keyboard.shift || keystring === Keyboard.s + Keyboard.shift + Keyboard.a || keystring === Keyboard.a + Keyboard.s + Keyboard.shift || keystring === Keyboard.a + Keyboard.shift + Keyboard.s || keystring === Keyboard.shift + Keyboard.a + Keyboard.s || keystring === Keyboard.shift + Keyboard.s + Keyboard.a) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(135, 2);
            }, 0);
        }
    }
    static keyUp(key) {
        if (!alt.isGameFocused) {
            Fly.keysActive = new Array();
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            return;
        }
        if (!(key + "" === Keyboard.w || key + "" === Keyboard.d || key + "" === Keyboard.s || key + "" === Keyboard.a || key + "" === Keyboard.shift)) return;
        for (let [index, keyActive] of Fly.keysActive.entries()){
            if (keyActive === key) {
                Fly.keysActive.splice(index, 1);
                break;
            }
        }
        if (Fly.keysActive.length === 0) {
            Fly.keysActive = new Array();
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            return;
        }
        let keystring = "";
        for (let keyActiv of this.keysActive){
            keystring = keystring + JSON.stringify(keyActiv);
        }
        if (keystring === Keyboard.w) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(0, 0.3);
            }, 0);
        } else if (keystring === Keyboard.d) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-90, 0.3);
            }, 0);
        } else if (keystring === Keyboard.s) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(180, 0.3);
            }, 0);
        } else if (keystring === Keyboard.a) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(90, 0.3);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.shift || keystring === Keyboard.shift + Keyboard.w) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(0, 2);
            }, 0);
        } else if (keystring === Keyboard.d + Keyboard.shift || keystring === Keyboard.shift + Keyboard.d) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-90, 2);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.shift || keystring === Keyboard.shift + Keyboard.s) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(180, 2);
            }, 0);
        } else if (keystring === Keyboard.a + Keyboard.shift || keystring === Keyboard.shift + Keyboard.a) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(90, 2);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.d || keystring === Keyboard.d + Keyboard.w) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-45, 0.3);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.a || keystring === Keyboard.a + Keyboard.w) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(45, 0.3);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.d || keystring === Keyboard.d + Keyboard.s) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-135, 0.3);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.a || keystring === Keyboard.a + Keyboard.s) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(135, 0.3);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.d + Keyboard.shift || keystring === Keyboard.w + Keyboard.shift + Keyboard.d || keystring === Keyboard.d + Keyboard.w + Keyboard.shift || keystring === Keyboard.d + Keyboard.shift + Keyboard.w || keystring === Keyboard.shift + Keyboard.d + Keyboard.w || keystring === Keyboard.shift + Keyboard.w + Keyboard.d) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-45, 2);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.a + Keyboard.shift || keystring === Keyboard.w + Keyboard.shift + Keyboard.a || keystring === Keyboard.a + Keyboard.w + Keyboard.shift || keystring === Keyboard.a + Keyboard.shift + Keyboard.w || keystring === Keyboard.shift + Keyboard.a + Keyboard.w || keystring === Keyboard.shift + Keyboard.w + Keyboard.a) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(45, 2);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.d + Keyboard.shift || keystring === Keyboard.s + Keyboard.shift + Keyboard.d || keystring === Keyboard.d + Keyboard.s + Keyboard.shift || keystring === Keyboard.d + Keyboard.shift + Keyboard.s || keystring === Keyboard.shift + Keyboard.d + Keyboard.s || keystring === Keyboard.shift + Keyboard.s + Keyboard.d) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-135, 2);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.a + Keyboard.shift || keystring === Keyboard.s + Keyboard.shift + Keyboard.a || keystring === Keyboard.a + Keyboard.s + Keyboard.shift || keystring === Keyboard.a + Keyboard.shift + Keyboard.s || keystring === Keyboard.shift + Keyboard.a + Keyboard.s || keystring === Keyboard.shift + Keyboard.s + Keyboard.a) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(135, 2);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.d + Keyboard.shift || keystring === Keyboard.w + Keyboard.shift + Keyboard.d || keystring === Keyboard.d + Keyboard.w + Keyboard.shift || keystring === Keyboard.d + Keyboard.shift + Keyboard.w || keystring === Keyboard.shift + Keyboard.d + Keyboard.w || keystring === Keyboard.shift + Keyboard.w + Keyboard.d) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(45, 2);
            }, 0);
        } else if (keystring === Keyboard.w + Keyboard.a + Keyboard.shift || keystring === Keyboard.w + Keyboard.shift + Keyboard.a || keystring === Keyboard.a + Keyboard.w + Keyboard.shift || keystring === Keyboard.a + Keyboard.shift + Keyboard.w || keystring === Keyboard.shift + Keyboard.a + Keyboard.w || keystring === Keyboard.shift + Keyboard.w + Keyboard.a) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-45, 0.3);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.d + Keyboard.shift || keystring === Keyboard.s + Keyboard.shift + Keyboard.d || keystring === Keyboard.d + Keyboard.s + Keyboard.shift || keystring === Keyboard.d + Keyboard.shift + Keyboard.s || keystring === Keyboard.shift + Keyboard.d + Keyboard.s || keystring === Keyboard.shift + Keyboard.s + Keyboard.d) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(-135, 0.3);
            }, 0);
        } else if (keystring === Keyboard.s + Keyboard.a + Keyboard.shift || keystring === Keyboard.s + Keyboard.shift + Keyboard.a || keystring === Keyboard.a + Keyboard.s + Keyboard.shift || keystring === Keyboard.a + Keyboard.shift + Keyboard.s || keystring === Keyboard.shift + Keyboard.a + Keyboard.s || keystring === Keyboard.shift + Keyboard.s + Keyboard.a) {
            if (Fly._movingTick) {
                clearInterval(Fly._movingTick);
                Fly._movingTick = null;
            }
            Fly._movingTick = setInterval(()=>{
                CameraSystem._cameras.get('fly').moving(135, 0.3);
            }, 0);
        }
    }
}
export default Fly;
// BindSystem.registerBindStartSystem([Fly.bind], BindTypes.all, Fly.toggleFlyActive);
// BindSystem.registerBindStopSystem([Fly.bind], BindTypes.all, Fly.toggleFlyActive);
alt.on('keydown', (key)=>{
    if (Fly.getBlock()) return;
    if (key === 88) {
        if (Fly.bindActive) return;
        if (!Fly.active) Fly.on();
        else if (Fly.active) Fly.off();
        return;
    }
    if (!Fly.active) return;
    Fly.keyDown(key);
});
alt.on('keyup', (key)=>{
    if (!Fly.active) return;
    Fly.keyUp(key);
});

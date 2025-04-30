import * as native from 'natives';
import { Entity } from 'alt-client';
/**
     * Переводит градусы в радианы
     * @param degrees - Градусы
     * @returns 
     */ function degreeToRadian(degrees) {
    return degrees * Math.PI / 180;
}
export class CameraSystem {
    static ActiveCamera = null;
    static blockAnimatedCamera = false;
    static _cameras = new Map();
    /**
     * Создать камеру и сделать ее активной.
     * @param {string} camName - ключ по которому можно будет использовать камеру.
     * @param {string} camType - {@link https://natives.altv.mp/#/0xB51194800B257161} названия камеры согласно ссылке.
     * @param {alt.Vector3} pos
     * @param {alt.Vector3} rot
     * @param {number} fov
     */ static createCamera(camName, camType, pos, rot, fov) {
        this.ActiveCamera = native.createCamWithParams(camType, pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, fov, false, 2);
        this._cameras.set(camName, new Camera(this.ActiveCamera, camType, {
            x: pos.x,
            y: pos.y,
            z: pos.z
        }, {
            x: rot.x,
            y: rot.y,
            z: rot.z
        }, 85));
        return;
    }
    /**
     * Анимированно переключиться на нужную камеру либо войти в режим камеры.
     * @param {string} camName - название камеры. Укажите ActiveCamera для включения активной камеры.
     */ static setCamera(camName) {
        if (this._cameras.has(camName) && this._cameras.get(camName)) {
            if (this.ActiveCamera) {
                native.setCamActive(this.ActiveCamera, false);
                native.renderScriptCams(false, true, 0, true, false, 0);
                this.ActiveCamera = this._cameras.get(camName)._cam;
                native.setCamActive(this.ActiveCamera, true);
                native.renderScriptCams(true, true, 0, true, false, 0);
                native.setCamAffectsAiming(this.ActiveCamera, false);
                this.blockAnimatedCamera = false;
                return;
            } else {
                this.ActiveCamera = this._cameras.get(camName)._cam;
                native.setCamActive(this.ActiveCamera, true);
                native.renderScriptCams(true, true, 0, true, false, 0);
                native.setCamAffectsAiming(this.ActiveCamera, false);
                this.blockAnimatedCamera = false;
                return;
            }
        }
        if (camName === 'ActiveCamera' && this.ActiveCamera) {
            native.renderScriptCams(false, true, 0, true, false, 0);
            native.setCamActive(this.ActiveCamera, true);
            native.renderScriptCams(true, true, 0, true, false, 0);
            native.setCamAffectsAiming(this.ActiveCamera, false);
            this.blockAnimatedCamera = false;
            return;
        }
        return;
    }
    /**
     * Удаляет все камеры.
     */ static async destroyAllCameras() {
        await Promise.resolve(native.renderScriptCams(false, false, 0, false, false, 0));
        await Promise.resolve(native.destroyAllCams(true));
        this.ActiveCamera = null;
        this._cameras.forEach((value, key)=>{
            this._cameras.set(key, null);
            this._cameras.delete(key);
        });
        this.blockAnimatedCamera = false;
        return;
    }
}
export class Camera extends Entity {
    constructor(camera, type, pos, rot, fov){
        super();
        this._type = type;
        this._pos = pos;
        this._rot = rot;
        this._fov = fov;
        this._cam = camera;
    }
    getCam() {
        return this._cam;
    }
    create() {
        this._camera = native.createCamWithParams(this._type, this._pos.x, this._pos.y, this._pos.z, this._rot.x, this._rot.y, this._rot.z, this._fov, false, 0);
    }
    moving(degree, speed) {
        if (degree > 360) {
            if (degree % 360) {
                degree = 0;
                return;
            }
            let difference = degree - Math.floor(degree / 360);
            degree = degree - difference;
        }
        let rotX = degreeToRadian(this._rot.x);
        let rotZ = degreeToRadian(this._rot.z + degree);
        if (degree === 90 || degree === -90) {
            this._pos.x = this._pos.x + speed * Math.sin(-rotZ);
            this._pos.y = this._pos.y + speed * Math.cos(-rotZ);
        } else {
            this._pos.x = this._pos.x + speed * (Math.cos(rotX) * Math.sin(-rotZ));
            this._pos.y = this._pos.y + speed * (Math.cos(rotX) * Math.cos(-rotZ));
            if (degree > 90 || degree < -90) {
                this._pos.z = this._pos.z + speed * Math.sin(-rotX);
            } else {
                this._pos.z = this._pos.z + speed * Math.sin(rotX);
            }
        }
        native.setCamCoord(this._cam, this._pos.x, this._pos.y, this._pos.z);
    }
    async setCamRot(rot) {
        this._rot = rot;
        await Promise.resolve(native.setCamRot(this._cam, rot.x, rot.y, rot.z, 2));
    }
    getCamPos() {
        return {
            x: this._pos.x,
            y: this._pos.y,
            z: this._pos.z
        };
    }
    getCamRot() {
        return {
            x: this._rot.x,
            y: this._rot.y,
            z: this._rot.z
        };
    }
}

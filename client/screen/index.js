import * as alt from "alt-client";
class Screen {
    static start() {
        alt.on('windowResolutionChange', this.setScreenResolution);
        this.screenResolution = alt.getScreenResolution();
        this.width = this.screenResolution.x;
        this.height = this.screenResolution.y;
    }
    static getScreenResolution() {
        this.screenResolution = alt.getScreenResolution();
        this.width = this.screenResolution.x;
        this.height = this.screenResolution.y;
        return this.screenResolution;
    }
    static getWidth() {
        this.screenResolution = alt.getScreenResolution();
        this.width = this.screenResolution.x;
        this.height = this.screenResolution.y;
        return this.width;
    }
    static getHeight() {
        this.screenResolution = alt.getScreenResolution();
        this.width = this.screenResolution.x;
        this.height = this.screenResolution.y;
        return this.height;
    }
    static getMiddleScreenResolution() {
        let middleResolution = new alt.Vector2(this.screenResolution.x / 2, this.screenResolution.y / 2);
        return middleResolution;
    }
    static setScreenResolution(oldResolution, newResolution) {
        this.screenResolution = newResolution;
        this.width = this.screenResolution.x;
        this.height = this.screenResolution.y;
    }
}
export default Screen;
Screen.start();

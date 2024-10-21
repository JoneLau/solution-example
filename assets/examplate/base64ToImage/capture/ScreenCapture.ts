import { _decorator,Animation, Camera,Component,RenderTexture,Size,  view} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScreenCapture')
export class ScreenCapture extends Component {
    @property(Camera)
    camera: Camera = null!

    @property(Animation)
    animation: Animation = null!

    @property
    count = 3

    start() {
        const defaultState = this.animation.getState(this.animation.defaultClip!.name)
        let count = this.count;
        if (count < 2) count = 2;
        defaultState.stop();
        const stepTime = defaultState.duration / count;
        const doAfterCap = () => {
            count--;
            if (count > 0) {
                defaultState.update(stepTime);
                this.doCapture(doAfterCap)
            }
        }
        defaultState.update(0);
        this.doCapture(doAfterCap);
    }

    private doCapture(doAfterCap = () => {

    }) {
        let vSize = new Size()
        vSize.width = Math.floor(view.getVisibleSize().width)
        vSize.height = Math.floor(view.getVisibleSize().height)
        let texture = new RenderTexture();
        texture.reset(vSize);
        this.camera.targetTexture = texture;
        this.scheduleOnce(() => {
            this.saveCapture(texture)
            this.camera.targetTexture = null;
            doAfterCap()
        }, 0)
    }

    private index = 0
    private timestamp = Date.now()
    private saveCapture(rt: RenderTexture) {
        let data: string = this.getImgBase(rt)
        this.saveAs(`${this.timestamp}_${++this.index}`, data);
    }

    private getImgBase(texture: RenderTexture) {
        const rtW = Math.floor(texture.width);
        const rtH = Math.floor(texture.height);
        let data = texture.readPixels(0, 0, rtW, rtH);

        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')!

        canvas.width = texture.width
        canvas.height = texture.height

        let width = texture.width
        let height = texture.height

        let imgData = ctx.createImageData(width, height);

        let rowBytes = width * 4;
        for (let row = 0; row < height; row++) {
            let srow = height - row;
            let start = srow * rowBytes;
            imgData.data.set(data.slice(start, start + rowBytes), row * rowBytes)
        }
        ctx.putImageData(imgData, 0, 0);
        let dataUrl = canvas.toDataURL('image/png')
        return dataUrl
    }

    private saveAs(fileName: string, data: any | string) {
        var element = document.createElement('a');
        if (typeof data === "string") {
            element.setAttribute('href', data);
        }
        else {
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
        }

        element.setAttribute('download', fileName);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}



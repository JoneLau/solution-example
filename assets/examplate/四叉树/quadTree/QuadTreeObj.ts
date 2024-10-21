import { Color, Component, Sprite, UITransform, Vec3, _decorator } from "cc";
import { Bounds } from "./Bounds";
const { ccclass, property } = _decorator;

@ccclass("QuadTreeObj")
export class QuadTreeObj extends Component {

    private uiTrans: UITransform = null;
    private sprite: Sprite = null;

    private bounds: Bounds = null;
    public get Bounds(): Bounds {
        return this.bounds;
    }
    public set Bounds(v: Bounds) {
        this.bounds = v;
    }

    onEnable() {
        let ts = this;
        ts.uiTrans = ts.getComponent(UITransform);
        ts.sprite = ts.getComponent(Sprite);
        ts.updateBounds();
    }

    updateBounds(){
        let ts = this;
        let pos: Vec3 = ts.node.getPosition();
        ts.bounds = Bounds.Create(pos.x, pos.y, ts.uiTrans.width, ts.uiTrans.height);
    }

    changeColor(color:Color) {
        let ts = this;
        ts.sprite.color = color;
    }

}

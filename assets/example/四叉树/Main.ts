import { _decorator, Component, Graphics, UITransform, Prefab, instantiate, Node, Vec3, EventMouse, Input, input, math, v3, Color } from 'cc';
import { Bounds } from './quadTree/Bounds';
import { QuadTree } from './quadTree/QuadTree';
import { QuadTreeObj } from './quadTree/QuadTreeObj';
import { QuadTreeUtil } from './quadTree/QuadTreeUtil';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {

    @property(Node)
    quadTreeObjLayer: Node = null;

    @property(Prefab)
    quadTreeObjPre: Prefab = null;

    @property(Graphics)
    graphic: Graphics = null;

    private uiTrans: UITransform = null;
    private quadTree: QuadTree = null;
    private retriveObj: QuadTreeObj = null;

    private allQuadTreeObj: QuadTreeObj[] = [];

    onEnable() {
        let ts = this;
        input.on(Input.EventType.MOUSE_UP, ts.onMouseUp, ts);
    }

    onDisable() {
        let ts = this;
        input.off(Input.EventType.MOUSE_UP, ts.onMouseUp, ts);
    }

    start() {
        let ts = this;
        ts.uiTrans = ts.getComponent(UITransform);
        QuadTree.drawGraphics = this.graphic;
        ts.quadTree = QuadTree.Create(Bounds.Create(0, 0, ts.uiTrans.width, ts.uiTrans.height), 0, 5);
        QuadTreeUtil.drawBorder(QuadTree.drawGraphics, ts.quadTree);
    }

    private mousePos: math.Vec2 = new math.Vec2();
    private retrievedObj: QuadTreeObj[] = [];
    onMouseUp(e: EventMouse) {
        let ts = this;
        e.getLocation(ts.mousePos);
        let worldPos: Vec3 = v3(ts.mousePos.x, ts.mousePos.y, 0);
        let id: number = e.getButton();
        if (id === EventMouse.BUTTON_LEFT) {//鼠标左键添加四叉树对象
            let quadTreeObj: QuadTreeObj = ts.createQuadTreeObj(worldPos);
            ts.allQuadTreeObj.push(quadTreeObj);
            ts.quadTree.insert(quadTreeObj);
        } else if (id === EventMouse.BUTTON_RIGHT) {//鼠标右键添加检索对象
            if (!ts.retriveObj) ts.retriveObj = ts.createQuadTreeObj(worldPos);
            let localPos: Vec3 = ts.uiTrans.convertToNodeSpaceAR(worldPos);
            ts.retriveObj.node.setPosition(localPos);
            ts.retriveObj.updateBounds();
            ts.retriveObj.changeColor(Color.BLUE);

            ts.retrievedObj = [];
            ts.quadTree.retrieve(ts.retrievedObj, ts.retriveObj);

            for (let i = 0; i < ts.allQuadTreeObj.length; i++) {
                const obj = ts.allQuadTreeObj[i];
                const color: Color = ts.retrievedObj.indexOf(obj) >= 0 ? Color.GREEN : Color.GRAY;
                obj.changeColor(color);
            }
        }
    }

    createQuadTreeObj(worldPos: Vec3) {
        let ts = this;
        let n: Node = instantiate(ts.quadTreeObjPre);
        let localPos: Vec3 = ts.uiTrans.convertToNodeSpaceAR(worldPos);
        n.setPosition(localPos);
        ts.quadTreeObjLayer.addChild(n);
        let quadTreeObj: QuadTreeObj = n.getComponent(QuadTreeObj);
        return quadTreeObj;
    }

}

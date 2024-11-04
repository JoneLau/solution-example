import { _decorator, Camera, Component, EventTouch, Node, resources, TiledMap, TiledMapAsset, UITransform, v2, v3 } from 'cc';
import { SCREEN_H, SCREEN_W } from './TileMapCfg';
import { TileMapLogic } from './TileMapLogic';
const { ccclass, property } = _decorator;

const temp_vec2 = v2();

@ccclass('TileMapView')
export class TileMapView extends Component {

    @property(Camera)
    mainCamera: Camera;

    @property(Node)
    targetFlag: Node;

    @property
    mapId = 91011;

    private tileMap: TiledMap;
    private tileUITrans: UITransform;
    private cameraScale = 1;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.tileMap = this.getComponent(TiledMap);
        this.tileUITrans = this.node.parent.getComponent(UITransform);
        this.mainCamera.orthoHeight = this.mainCamera.orthoHeight * this.cameraScale;
    }

    start() {
        this.loadMap();
    }

    loadMap() {
        resources.load(`tiledMap/map_${this.mapId}`, (err: Error, data: TiledMapAsset) => {
            if (err) return console.log(err);
            this.tileMap.tmxAsset = data;
            TileMapLogic.initMapInfo(this.tileMap);
        });
    }

    touchEnd(event: EventTouch) {
        let aimPos = event.getUILocation();
        if (aimPos.x < 0 || aimPos.x > SCREEN_W || aimPos.y < 0 || aimPos.y > SCREEN_H) { // 手动包围盒
            return;
        }

        let tileSize = this.tileMap.getTileSize();
        // let wpos = this.mainCamera.screenToWorld(v3(aimPos.x, aimPos.y, 0));
        let pos = this.tileUITrans.convertToNodeSpaceAR(v3(aimPos.x, aimPos.y, 0));
        // let posA = this.mainCamera.convertToUINode(v3(aimPos.x, aimPos.y, 0), this.node.parent);
        // console.log("pos  ", pos, "    posA ", posA);
        // pos.z = 0;
        // Vec3.multiplyScalar(pos, pos, this.cameraScale);
        const str = TileMapLogic.getCellIdByUIPos(pos);

        console.log('touch coordinate', str);

    }
}

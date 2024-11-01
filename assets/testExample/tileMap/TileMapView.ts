import { _decorator, Camera, Component, EventTouch, Node, resources, TiledMap, TiledMapAsset, v3, view } from 'cc';
import { SCREEN_H, SCREEN_W } from './TileMapCfg';
import { TileMapLogic } from './TileMapLogic';
const { ccclass, property } = _decorator;

@ccclass('TileMapView')
export class TileMapView extends Component {

    @property(Camera)
    mainCamera: Camera;

    @property(Node)
    targetFlag: Node;

    @property
    mapId = 91011;

    private tileMap: TiledMap;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.tileMap = this.getComponent(TiledMap);
        this.mainCamera.orthoHeight = view.getVisibleSize().height;
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

        let wpos = this.mainCamera.screenToWorld(v3(aimPos.x, aimPos.y, 0));
        let pos = this.mainCamera.convertToUINode(wpos, this.node.parent);
    }
}

import { _decorator, Camera, Component, EventTouch, Node, resources, SpriteFrame, TiledMap, TiledMapAsset, UITransform, v3 } from 'cc';
import { HALF_W, SCREEN_H, SCREEN_W, tileMapHeight, tileMapUnionH, tileMapUnionW, tileMapWidth } from './TileMapCfg';
import { TileMapLogic } from './TileMapLogic';
const { ccclass, property } = _decorator;

const temp_vec3 = v3();

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
    private isTouchMove = false;
    private cachePos = v3();

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.tileMap = this.getComponent(TiledMap);
        this.tileUITrans = this.node.parent.getComponent(UITransform);
        this.mainCamera.orthoHeight = this.mainCamera.orthoHeight * this.cameraScale;
    }

    start() {
        Promise.all([
            this.loadMap(),
            // this.loadTourist,
        ]);
    }

    async loadMap() {
        resources.load(`tiledMap/map_${this.mapId}`, (err: Error, data: TiledMapAsset) => {
            if (err) {
                return console.error("加载不到匹配的地图");
            }

            this.tileMap.tmxAsset = data;
            TileMapLogic.initMapInfo(this.tileMap);
        });
    }

    loadTourist(resolve, reject) {
        resources.load(`textures/touristHead/tourist_${3}`, SpriteFrame, (err: Error, data: SpriteFrame) => {
            if (err) {
                return;
            }

            resolve(0);
        });
    }

    touchStart(event: EventTouch) {
        const row = 11;
        const col = 2;
        let pos = this.tileMap.getLayers()[0].getPositionAt(row, col);
        pos.x = pos.x + tileMapUnionW / 2 - tileMapWidth / 2;
        pos.y = pos.y + tileMapUnionH / 2 - tileMapHeight / 2;
        this.cachePos.set(pos.x, pos.y);
    }

    touchMove(event: EventTouch) {
        let delta = event.getUIDelta();
        temp_vec3.set(this.mainCamera.node.position);
        temp_vec3.x -= delta.x;
        if ((temp_vec3.x + HALF_W) >= tileMapWidth / 2 || (temp_vec3.x - HALF_W) <= (-tileMapWidth / 2))
            return console.log("超出边界");

        this.mainCamera.node.setPosition(temp_vec3);
        this.isTouchMove = true;
    }

    touchEnd(event: EventTouch) {
        if (this.isTouchMove) {
            this.isTouchMove = false;
            return;
        }
        let aimPos = event.getUILocation();
        if (aimPos.x < 0 || aimPos.x > SCREEN_W || aimPos.y < 0 || aimPos.y > SCREEN_H) { // 手动包围盒
            return;
        }

        let location = event.getLocation();
        let wpos = this.mainCamera.screenToWorld(v3(location.x, location.y, 0));
        let pos = this.tileUITrans.convertToNodeSpaceAR(wpos);
        const str = TileMapLogic.getCellIdByUIPos(pos);

        console.log('touch coordinate', str);
        this.isTouchMove = false;
    }
}

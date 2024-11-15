import { _decorator, Camera, Component, EventTouch, Node, resources, Sprite, SpriteFrame, TiledMap, TiledMapAsset, tween, UITransform, v3 } from 'cc';
import { HALF_W, SCREEN_H, SCREEN_W, tileMapBlockCol, tileMapBlockRow, tileMapHeight, tileMapUnionH, tileMapUnionW, tileMapWidth } from './TileMapCfg';
import { TileMapLogic } from './TileMapLogic';
const { ccclass, property } = _decorator;

const temp_vec3 = v3();

class UnionPoint {
    /** 到终点权值 */
    hNum: number;
    /** 到起点权值 */
    gNum: number;
    /** 坐标点id */
    id: string;
    /** 父对象ID */
    parent: string;
    constructor(tid: string) {
        this.id = tid;
    }
    /** 最终权重值 */
    get p(): number {
        return this.hNum + this.gNum;
    }
}

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
    private tourist: Node;
    private cameraScale = 1;
    private isTouchMove = false;
    private cachePos = v3();
    private startPosId = '';
    private endPosId = '';
    private unionMapPos = new Map<string, UnionPoint>();
    private isSearchEnd = false;
    private searchPosList: string[] = [];
    private closeList: string[] = [];

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.tileMap = this.getComponent(TiledMap);
        this.tileUITrans = this.node.parent.getComponent(UITransform);
        this.mainCamera.orthoHeight = this.mainCamera.orthoHeight * this.cameraScale;
    }

    start() {
        this.startPosId = TileMapLogic.getCellIdByRowCol(11, 7);
        this.loadMap();

    }

    async loadMap() {
        resources.load(`tiledMap/map_${this.mapId}`, (err: Error, data: TiledMapAsset) => {
            if (err) {
                return console.error("加载不到匹配的地图");
            }

            this.tileMap.tmxAsset = data;
            TileMapLogic.initMapInfo(this.tileMap);
            this.loadTourist();
        });
    }

    loadTourist() {
        resources.load(`textures/touristHead/tourist_${4}/spriteFrame`, (err: Error, data: SpriteFrame) => {
            if (err) {
                return;
            }

            const tourist = this.tourist = new Node("tourist");
            const sp = tourist.addComponent(Sprite);
            sp.spriteFrame = data;
            sp.getComponent(UITransform).setAnchorPoint(0.5, 0);
            const layer = this.tileMap.getLayer("event1");
            tourist.parent = layer.node;
            tourist.layer = layer.node.layer;
            layer.addUserNode(tourist);
            tourist.setPosition(TileMapLogic.getPosByRowCol(11, 7));
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
        const endPosId = TileMapLogic.getCellIdByUIPos(pos);
        if (!endPosId) return;
        const cell = TileMapLogic.getRowColById(endPosId);
        this.endPosId = TileMapLogic.getCellIdByRowCol(cell.row, cell.col);
        // console.log('touch coordinate', str);
        this.isTouchMove = false;

        this.findPathList();
    }

    findPathList() {
        if (this.startPosId === this.endPosId) return;
        this.unionMapPos.clear();
        this.searchPosList.length = 0;
        this.closeList.length = 0;
        this.isSearchEnd = false;
        console.log(`当前位置 ${this.startPosId}  目标位置 ${this.endPosId}`);
        this.searchPosList.push(this.startPosId);
        this.checkSearch();
        const pathes = this.getPath();
        if (pathes.length <= 0) return console.log("没有移动");
        let pathStr = "";
        const tweenMove = tween(this.tourist);
        pathes.forEach((path) => {
            pathStr += path + "/";
            const rowCol = TileMapLogic.getRowColById(path);
            const targetPos = TileMapLogic.getPosByRowCol(rowCol.row, rowCol.col);
            tweenMove.to(0.5, { position: targetPos });
        });
        tweenMove.start();
        this.startPosId = this.endPosId;
        console.log("最佳路径", pathStr);
    }

    checkSearch() {
        while (!this.isSearchEnd) {
            const posId = this.searchPosList.shift();
            this.searchPoint(posId);
        }
    }

    searchPoint(posId: string) {
        let isStart = posId === this.startPosId;
        let isEnd = posId === this.endPosId;
        let union = this.unionMapPos.get(posId);
        if (!union) {
            union = this.createUnion(posId);
        }

        let pUnion: UnionPoint = null;
        if (isStart) {
            union.gNum = 0;
        } else if (isEnd) {
            this.isSearchEnd = true;
            this.closeList.push(posId);
            return;
        } else {
            if (union.parent) {
                pUnion = this.unionMapPos.get(union.parent);
                union.gNum = pUnion.gNum + 10;
            }
        }

        this.closeList.push(posId);
        const tArray = this.getPointNearBy(posId);
        for (let i = 0; i < tArray.length; i++) {
            const element = tArray[i];
            union = this.unionMapPos.get(element);
            if (!union) {
                union = this.createUnion(element, posId);
                if (pUnion) {
                    union.gNum = pUnion.gNum + 10;
                }
            }

            if (this.closeList.indexOf(element) === -1) {
                if (this.searchPosList.indexOf(element) === -1) {
                    this.searchPosList.push(element);
                }
            }
        }
    }

    getPointNearBy(posId: string) {
        let tArray: string[] = [];
        let cArray = [[-1, 0], [0, -1], [0, 1], [1, 0]];
        const tRowCol = TileMapLogic.getRowColById(posId);
        for (let i = 0; i < cArray.length; i++) {
            const row = tRowCol.row + cArray[i][0];
            const col = tRowCol.col + cArray[i][1];
            let newID = TileMapLogic.getCellIdByRowCol(row, col);
            if (row < 0 || col < 0 || row >= tileMapBlockRow || col >= tileMapBlockCol) continue;
            tArray.push(newID);
        }
        return tArray;
    }

    getPath() {
        let line: string[] = [];
        if (!this.isSearchEnd) console.warn("路径未搜索完成");
        let searchPoint = this.endPosId;
        while (searchPoint && searchPoint !== this.startPosId) {
            line.unshift(searchPoint);
            searchPoint = this.unionMapPos.get(searchPoint).parent;
        }
        return line;
    }

    createUnion(posId: string, parent?: string) {
        const union = new UnionPoint(posId);
        this.unionMapPos.set(posId, union);
        //上一条位置
        if (parent) {
            union.parent = parent;
        }
        return union;
    }
}

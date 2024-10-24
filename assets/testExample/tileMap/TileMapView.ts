import { _decorator, Camera, Component, instantiate, Node, resources, TiledMap, TiledMapAsset, view } from 'cc';
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
        this.tileMap = this.getComponent(TiledMap);
        this.mainCamera.orthoHeight = view.getVisibleSize().height * 2;
    }

    start() {
        resources.load(`tiledMap/map_${this.mapId}`, (err: Error, data: TiledMapAsset) => {
            this.tileMap.tmxAsset = data;
            const blankLayer = this.tileMap.getLayer("blank");
            // const wallLayer = this.tileMap.getLayer("wall");
            // const eventLayer = this.tileMap.getLayer("event1");
            let size = blankLayer.getLayerSize();
            let row = size.height;
            let col = size.width;
            let posMap = new Map<string, boolean>();
            posMap.set("5.6", true);
            posMap.set("8.8", true);
            posMap.set("9.6", true);
            posMap.set("11.11", true);
            let x = -blankLayer.leftDownToCenterX;
            let y = -blankLayer.leftDownToCenterY;
            // let str = "\n";
            let mapTileSize = blankLayer.getMapTileSize();
            let layers = this.tileMap.getLayers();
            for (let j = 0; j < row; j++) {
                for (let i = 0; i < col; i++) {
                    if (posMap.get(`${i}.${j}`)) {
                        let pos = blankLayer.getPositionAt(i, j);
                        const ins = instantiate(this.targetFlag);
                        ins.parent = this.node.parent;
                        ins.active = true;
                        ins.setPosition(x + pos.x + mapTileSize.width / 2, y + pos.y + mapTileSize.height / 2, 0);
                        layers.forEach((layer) => {
                            layer.tiles[i * col + j] = 0;
                            // layer.setTiledTileAt()
                        });
                        // eventLayer.addUserNode(ins);
                    }
                    // str += `${i}.${j} pos: ${blankLayer.getPositionAt(i, j)} \n`;
                }
            }

            // const gid = wallLayer.getTileGIDAt(1, 6);
            // const tex = wallLayer.getTexture(gid);
            // console.log("查看位置坐标数据:" + str);
        });

        console.log("this is log");
        console.debug("this is debug");
        console.group("this is info");
        console.log("this is logA");
        console.log("this is logB");
        console.groupEnd();
    }

}

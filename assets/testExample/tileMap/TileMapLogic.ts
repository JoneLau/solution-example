import { TiledMap, UITransform, Vec2, Vec3 } from "cc";
import { setCurMapSize, tileMapBlockH, tileMapUnionH, tileMapUnionW } from "./TileMapCfg";
import { TiledCell, TileMapMod } from "./TileMapMod";

export class TileMapLogic {
    /** 初始化地图尺寸 */
    static initMapInfo(tiled: TiledMap) {
        let size = tiled.getComponent(UITransform).contentSize;
        //默认地图不做缩放
        const cw = size.width;
        const ch = size.height;
        const tileSize = tiled.getTileSize();
        const mapSize = tiled.getMapSize();
        setCurMapSize({
            mapSizeW: cw,
            mapSizeH: ch,
            mapUnionSizeW: tileSize.x,
            mapUnionSizeH: tileSize.y,
            mapBlockW: mapSize.width,
            mapBlockH: mapSize.height,
        });

        const mapInfo = TileMapMod.tileMapInfo;
        mapInfo.eventIdToGID = new Map();
        mapInfo.GIDToEventId = new Map();
        mapInfo.cellMap = new Map();
        const startX = -cw / 2;
        const startY = -ch / 2;
        let props = tiled._tileProperties;
        for (const [name, prop] of props) {
            if (prop["eventId"]) {
                const eventId = prop["eventId"] as number;
                mapInfo.eventIdToGID.set(eventId, name);
                mapInfo.GIDToEventId.set(name, eventId);
            }
        }

        let cell: TiledCell;
        for (let i = 0; i < mapSize.width; i++) {
            for (let j = 0; j < mapSize.height; j++) {
                cell = this.createMapCell(tiled, i, j);
                cell.pos.x += startX;
                cell.pos.y += startY;
                mapInfo.cellMap.set(cell.cellId, cell);
            }
        }
    }

    /** 创建格子数据 */
    static createMapCell(tiled: TiledMap, x: number, y: number) {
        const tiledLayersGID: number[] = [];
        const blockIdx = this.getBlockIdxByRowCol(x, y);
        const cellId = `${x}.${y}`;
        let layers = tiled.getLayers();
        let pos: Vec2;
        for (let l = 0; l < layers.length; l++) {
            let layer = layers[l];
            let GID = layer.tiles[blockIdx];
            tiledLayersGID.push(GID);
            if (!pos) {
                pos = layer.getPositionAt(x, y);
                pos.x += tileMapUnionW / 2;
                pos.y += tileMapUnionH / 2;
            }
            // layer.tiles[blockIdx] = 0;
        }

        return {
            cellId,
            GIDList: tiledLayersGID,
            pos,
        };
    }

    /** 获得格子编号 */
    static getBlockIdxByRowCol(row: number, col: number) {
        return tileMapBlockH * row + col;
    }

    static getCellIdByUIPos(pos: Vec3) {

    }

    /** UI坐标系中的坐标点转换成需要的场景坐标 */
    static getScreenPos(pos: Vec3) {
        // const designSize = view.getDesignResolutionSize();
        // const halfDesignH = designSize.height / 2;
        // const halfDesignW = designSize.width / 2;
        // if (!TravelCamera.ins) return null;
        // const cmrPos = TravelCamera.ins.node.position;
        // const tIndent = TravelCamera.ins.indentMul;
        // const rat = HALF_H / halfDesignH;

        // let posX = (pos.x - halfDesignW) * tIndent + cmrPos.x;
        // let posY = (pos.y / rat - halfDesignH) * tIndent + cmrPos.y;
        // return v3(posX, posY);
    }
}

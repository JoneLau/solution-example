import { TiledMap, UITransform, Vec2, Vec3 } from "cc";
import { setCurMapSize, tileMapBlockCol, tileMapBlockRow, tileMapHeight, tileMapUnionH, tileMapUnionW, tileMapWidth } from "./TileMapCfg";
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
        return tileMapBlockCol * row + col;
    }

    /** 获取当前地图斜率 像素高/像素宽 */
    static slope(): number {
        return tileMapHeight / tileMapWidth;
    }

    /** 判断行是否在地图内 */
    static judgeRow(row: number): boolean {
        return (row >= 0 && row < tileMapBlockRow);
    }

    /** 判断列是否在地图内 */
    static judgeCol(col: number): boolean {
        return (col >= 0 && col < tileMapBlockCol);
    }

    /** 获取格子ID根据cell */
    static getCellIdByRowCol(row: number, col: number): string {
        return row + "." + col;
    }

    static getCellIdByUIPos(pos: Vec3) {
        const rowCol = this.getRawColByPos(pos);
        if (this.judgeRow(rowCol.row) && this.judgeCol(rowCol.col)) {
            return this.getCellIdByRowCol(rowCol.row, rowCol.col);
        }
    }

    /** 通过坐标获取行列值 地图以左下角为原点
     * @param pos 当前探索的坐标值
     * @param return 获取到的行列值
    */
    // static getRawColByPos(pos: Vec3) {
    //     const rawX = pos.x - pos.y / this.slope();
    //     const rawY = pos.y + pos.x * this.slope();
    //     const row = Math.ceil(rawX / tileMapUnionW + tileMapBlockRow / 2 - 1);
    //     const col = Math.ceil(tileMapBlockCol / 2 - rawY / tileMapUnionH - 1);
    //     return { row, col };
    // }

    static getRawColByPos(pos: Vec3) {
        let row = Math.floor((pos.x / tileMapUnionW + tileMapBlockCol - 1 + pos.y / tileMapUnionH) / 2);
        let col = Math.floor((2 * tileMapBlockRow + tileMapBlockCol - 3 - pos.y / tileMapUnionH - pos.x / tileMapUnionW) / 2);
        return { row, col };
    }
}

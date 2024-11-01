import { js, Vec2 } from "cc";

export class TileMapMod {

    static tileMapInfo: TiledMapInfo = js.createMap();
}

/** 单个格子信息 */
export interface TiledCell {
    /** 格子ID x.y */
    cellId: string,
    /** idx下标未层级,值为图片Id,如果为负数代表格子被占了，但不显示图片 */
    GIDList: number[],
    /** 坐标 */
    pos: Vec2,
}

export interface TiledMapInfo {
    /** 地图格子信息 <格子Id,格子信息> */
    cellMap?: Map<string, TiledCell>;
    /** 事件ID对应npcID */
    eventIdToGID?: Map<number, number>,
    /** 图片ID对应的事件ID */
    GIDToEventId?: Map<number, number>,
}

import { view } from "cc";

const size = view.getVisibleSize();
export const SCREEN_W = size.width;
export const SCREEN_H = size.height;
export const HALF_W = SCREEN_W / 2;
export const HALF_H = SCREEN_H / 2;

/** tiled图片水平翻转因子 */
export const picFlipH = 2147483648;
/** map名称前缀 */
export const mapNamePrefix = "map_";
/** 当前地图宽 */
export let tileMapWidth: number;
/** 当前地图高 */
export let tileMapHeight: number;
/** 当前地图块/宽 */
export let tileMapUnionW: number;
/** 当前地图块/高 */
export let tileMapUnionH: number;
/** 当前地图块数量/横 */
export let tileMapBlockRow: number;
/** 当前地图块数量/纵 */
export let tileMapBlockCol: number;
/** 屏幕可显示地图块数量/横 */
export let wPiece: number;
/** 屏幕可显示地图块数量/纵 */
export let hPiece: number;

export interface IMapSize {
    mapSizeW: number;
    mapSizeH: number;
    mapUnionSizeW: number;
    mapUnionSizeH: number;
    mapBlockW: number;
    mapBlockH: number;
}

/** 设置当前地图大小 /像素 */
export function setCurMapSize(mapSize: IMapSize) {
    tileMapWidth = mapSize.mapSizeW;
    tileMapHeight = mapSize.mapSizeH;
    tileMapUnionW = mapSize.mapUnionSizeW;
    tileMapUnionH = mapSize.mapUnionSizeH;
    tileMapBlockRow = mapSize.mapBlockW;
    tileMapBlockCol = mapSize.mapBlockH;
    wPiece = Math.ceil(SCREEN_W / tileMapUnionW) + 1;
    hPiece = Math.ceil(SCREEN_H / tileMapUnionH) + 1;
}

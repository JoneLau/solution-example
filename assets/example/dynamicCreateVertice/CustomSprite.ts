import { _decorator, Sprite, Vec2 } from "cc";
import { CustomSpriteAssembler } from "./CustomSpriteAssembler";

const { ccclass, property } = _decorator;

/** 实现UI自定义顶点 */
@ccclass("CustomSprite")
export class CustomSprite extends Sprite {
    @property({ override: true, visible: false })
    get type() {
        return this._type;
    }
    @property({ override: true, visible: false })
    get fillType() {
        return this._fillType;
    }
    @property({ override: true, visible: false })
    get sizeMode() {
        return this._sizeMode;
    }
    @property({ override: true, visible: false })
    get fillCenter(): Vec2 {
        return this._fillCenter;
    }
    @property({ override: true, visible: false })
    get fillStart(): number {
        return this._fillStart;
    }
    @property({ override: true, visible: false })
    get fillRange(): number {
        return this._fillRange;
    }
    @property({ override: true, visible: false })
    get trim(): boolean {
        return this._isTrimmedMode;
    }
    @property({ override: true, visible: false })
    get grayscale(): boolean {
        return this._useGrayscale;
    }

    @property({ displayName: "行数", tooltip: "顶点的行数，默认是11行" })
    get vertRows() {
        return this._vertRows;
    }

    set vertRows(value) {
        if (this._vertRows === value) return;
        this._vertRows = value;
        this._rebuildData();
    }

    @property({ displayName: "列数", tooltip: "顶点的列数，默认是11列" })
    get vertCols() {
        return this._vertCols;
    }

    set vertCols(value) {
        if (this._vertCols === value) return;
        this._vertCols = value;
        this._rebuildData();
    }

    protected _vertRows = 11;
    protected _vertCols = 11;

    protected _flushAssembler(): void {
        const assembler = CustomSpriteAssembler;

        if (this._assembler !== assembler) {
            this.destroyRenderData();
            this._assembler = assembler;
        }

        if (!this._renderData) {
            if (this._assembler && this._assembler.createData) {
                this._renderData = this._assembler.createData(this);
                this._renderData!.material = this.getRenderMaterial(0);
                this.markForUpdateRenderData();
                if (this.spriteFrame) {
                    this._assembler.updateUVs(this);
                }
                this._updateColor();
            }
        }
    }

    protected _rebuildData() {
        if (!this.renderData) return;
        this.destroyRenderData();
        this._flushAssembler();
    }
}

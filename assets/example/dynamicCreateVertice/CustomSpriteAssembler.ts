import { dynamicAtlasManager, IAssembler, IRenderData, RenderData } from "cc";
import { CustomSprite } from "./CustomSprite";

export const CustomSpriteAssembler: IAssembler = {
    createData(sprite: CustomSprite) {
        const renderData = sprite.requestRenderData();
        const rows = sprite.vertRows;
        const cols = sprite.vertCols;
        const vNum = rows * cols;
        renderData.dataLength = vNum;
        renderData.resize(vNum, (rows - 1) * (cols - 1) * 6);

        let indexBuffer = CustomSpriteAssembler.GetIndexBuffer(sprite);
        renderData.chunk.setIndexBuffer(indexBuffer);
        return renderData;
    },

    // 构造网格的顶点索引列表
    GetIndexBuffer(sprite: CustomSprite) {
        const rows = sprite.vertRows;
        const cols = sprite.vertCols;
        const indexBuffer = [];
        let index = 0;
        for (let i = 0; i < rows - 1; i++) {
            for (let j = 0; j < cols - 1; j++) {
                const p1 = i * cols + j;
                const p2 = i * cols + j + 1;
                const p3 = (i + 1) * cols + j;
                const p4 = (i + 1) * cols + j + 1;
                indexBuffer[index++] = p1;
                indexBuffer[index++] = p2;
                indexBuffer[index++] = p3;
                indexBuffer[index++] = p2;
                indexBuffer[index++] = p4;
                indexBuffer[index++] = p3;
            }
        }
        return indexBuffer;
    },

    // 照抄simple的
    updateRenderData(sprite: CustomSprite) {
        const frame = sprite.spriteFrame;

        dynamicAtlasManager.packToDynamicAtlas(sprite, frame);
        this.updateUVs(sprite); // dirty need
        //this.updateColor(sprite);// dirty need

        const renderData = sprite.renderData;
        if (renderData && frame) {
            if (renderData.vertDirty) {
                this.updateVertexData(sprite);
            }
            renderData.updateRenderData(sprite, frame);
        }
    },

    // 局部坐标转世界坐标 照抄的，不用改
    updateWorldVerts(sprite: CustomSprite, chunk: { vb: Float32Array }) {
        const renderData = sprite.renderData!;
        const vData = chunk.vb;

        const dataList: IRenderData[] = renderData.data;
        const node = sprite.node;
        const m = node.worldMatrix;

        const m00 = m.m00; const m01 = m.m01; const m02 = m.m02; const m03 = m.m03;
        const m04 = m.m04; const m05 = m.m05; const m06 = m.m06; const m07 = m.m07;
        const m12 = m.m12; const m13 = m.m13; const m14 = m.m14; const m15 = m.m15;

        const stride = renderData.floatStride;
        let offset = 0;
        const length = dataList.length;
        for (let i = 0; i < length; ++i) {
            const curData = dataList[i];
            const x = curData.x;
            const y = curData.y;
            let rhw = m03 * x + m07 * y + m15;
            rhw = rhw ? 1 / rhw : 1;

            offset = i * stride;
            vData[offset + 0] = (m00 * x + m04 * y + m12) * rhw;
            vData[offset + 1] = (m01 * x + m05 * y + m13) * rhw;
            vData[offset + 2] = (m02 * x + m06 * y + m14) * rhw;
        }
    },

    // 每帧调用的，把数据和到一整个meshbuffer里
    fillBuffers(sprite: CustomSprite) {
        if (sprite === null) {
            return;
        }

        const renderData = sprite.renderData!;
        const chunk = renderData.chunk;
        if (sprite["_flagChangedVersion"] !== sprite.node["flagChangedVersion"] || renderData.vertDirty) {
            // const vb = chunk.vertexAccessor.getVertexBuffer(chunk.bufferId);
            this.updateWorldVerts(sprite, chunk);
            renderData.vertDirty = false;
            sprite["_flagChangedVersion"] = sprite.node["flagChangedVersion"];
        }

        // quick version
        const vidOrigin = chunk.vertexOffset;
        const meshBuffer = chunk.meshBuffer;
        const ib = meshBuffer.iData;
        let indexOffset = meshBuffer.indexOffset;

        const vid = vidOrigin;
        // 沿着当前这个位置往后将我们这个对象的index放进去
        let indexBuffer = CustomSpriteAssembler.GetIndexBuffer(sprite);
        for (let i = 0; i < renderData.indexCount; i++) {
            ib[indexOffset++] = vid + indexBuffer[i];
        }
        meshBuffer.indexOffset += renderData.indexCount;
    },

    // 计算每个顶点相对于sprite坐标的位置
    updateVertexData(sprite: CustomSprite) {
        const renderData: RenderData | null = sprite.renderData;
        if (!renderData) {
            return;
        }

        const uiTrans = sprite.node._uiProps.uiTransformComp!;
        const dataList: IRenderData[] = renderData.data;
        const cw = uiTrans.width;
        const ch = uiTrans.height;
        const appX = uiTrans.anchorX * cw;
        const appY = uiTrans.anchorY * ch;

        const left = 0 - appX;
        // const right = cw - appX;
        // const top = ch - appY;
        const bottom = 0 - appY;

        const rows = sprite.vertRows;
        const cols = sprite.vertCols;
        const stepX = cw / (cols - 1);
        const stepY = ch / (rows - 1);

        // renderData.dataLength = rows * cols;
        let index = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let data = dataList[index];
                let y = bottom + i * stepY;
                let x = left + j * stepX;

                data.x = x;
                data.y = y;
                index++;
            }
        }

        renderData.vertDirty = true;
    },

    // 更新计算uv
    updateUVs(sprite: CustomSprite) {
        if (!sprite.spriteFrame) return;
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        const uv = sprite.spriteFrame.uv;

        // 这里我打印了一下uv的值，第一个看上去是左上角，但其实，opengl端的纹理存在上下颠倒问题，所以这里其实还是左下角
        // 左下，右下，左上，右上
        const uv_l = uv[0];
        const uv_b = uv[1];
        const uv_r = uv[2];
        const uv_t = uv[5];
        const uv_w = Math.abs(uv_r - uv_l);
        const uv_h = Math.abs(uv_b - uv_t);

        const rows = sprite.vertRows;
        const cols = sprite.vertCols;
        const stepU = uv_w / (cols - 1);
        const stepV = uv_h / (rows - 1);

        // 用相对坐标，计算uv
        let index = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let v = 1 - (uv_t + i * stepV);
                let u = uv_l + j * stepU;
                vData[index * renderData.floatStride + 3] = u;
                vData[index * renderData.floatStride + 4] = v;
                index++;
            }
        }
    },

    // 照抄，不用改
    updateColor(sprite: CustomSprite) {
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        let colorOffset = 5;
        const color = sprite.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;
        for (
            let i = 0;
            i < renderData.dataLength;
            i++, colorOffset += renderData.floatStride
        ) {
            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    },
};

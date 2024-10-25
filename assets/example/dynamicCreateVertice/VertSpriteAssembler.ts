import { Color, dynamicAtlasManager, IAssembler, IRenderData, RenderData } from "cc";
import { VertSprite } from "./VertSprite";

export const VertSpriteAssembler: IAssembler = {
  // 构造网格的顶点索引列表
  GetIndexBuffer(sprite: VertSprite) {
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
  createData(sprite: VertSprite) {
    const renderData = sprite.requestRenderData();
    const rows = sprite.vertRows;
    const cols = sprite.vertCols;
    const vNum = rows * cols;
    renderData.dataLength = vNum;
    renderData.resize(vNum, (rows - 1) * (cols - 1) * 6);

    let indexBuffer = VertSpriteAssembler.GetIndexBuffer(sprite);
    renderData.chunk.setIndexBuffer(indexBuffer);
    return renderData;
  },

  // 照抄simple的
  updateRenderData(sprite: VertSprite) {
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
  updateWorldVerts(sprite: VertSprite, chunk: { vb: Float32Array }) {
    const renderData = sprite.renderData!;
    const vData = chunk.vb;

    const dataList: IRenderData[] = renderData.data;
    const node = sprite.node;
    const m = node.worldMatrix;

    const stride = renderData.floatStride;
    let offset = 0;
    const length = dataList.length;
    for (let i = 0; i < length; i++) {
      const curData = dataList[i];
      const x = curData.x;
      const y = curData.y;
      let rhw = m.m03 * x + m.m07 * y + m.m15;
      rhw = rhw ? 1 / rhw : 1;

      offset = i * stride;
      vData[offset + 0] = (m.m00 * x + m.m04 * y + m.m12) * rhw;
      vData[offset + 1] = (m.m01 * x + m.m05 * y + m.m13) * rhw;
      vData[offset + 2] = (m.m02 * x + m.m06 * y + m.m14) * rhw;
    }
  },

  // 每帧调用的，把数据和到一整个meshbuffer里
  fillBuffers(sprite: VertSprite) {
    if (sprite === null) {
      return;
    }

    const renderData = sprite.renderData!;
    const chunk = renderData.chunk;
    if (sprite.node.hasChangedFlags || renderData.vertDirty) {
      // const vb = chunk.vertexAccessor.getVertexBuffer(chunk.bufferId);
      this.updateWorldVerts(sprite, chunk);
      renderData.vertDirty = false;
    }
    if (
      sprite["_flagChangedVersion"] !== sprite.node["flagChangedVersion"] ||
      renderData.vertDirty
    ) {
      // const vb = chunk.vertexAccessor.getVertexBuffer(chunk.bufferId);
      this.updateWorldVerts(sprite, chunk);
      renderData.vertDirty = false;
      sprite["_flagChangedVersion"] = sprite.node["flagChangedVersion"];
    }

    // quick version
    const bid = chunk.bufferId;
    const vidOrigin = chunk.vertexOffset;
    const meshBuffer = chunk.meshBuffer;
    const ib = chunk.meshBuffer.iData;
    let indexOffset = meshBuffer.indexOffset;

    const vid = vidOrigin;
    // 沿着当前这个位置往后将我们这个对象的index放进去
    let indexBuffer = VertSpriteAssembler.GetIndexBuffer(sprite);
    for (let i = 0; i < renderData.indexCount; i++) {
      ib[indexOffset++] = vid + indexBuffer[i];
    }
    meshBuffer.indexOffset += renderData.indexCount;
  },

  // 计算每个顶点相对于sprite坐标的位置
  updateVertexData(sprite: VertSprite) {
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
    const right = cw - appX;
    const top = ch - appY;
    const bottom = 0 - appY;

    const rows = sprite.vertRows;
    const cols = sprite.vertCols;
    const stepX = cw / (cols - 1);
    const stepY = ch / (rows - 1);

    let index = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let data = dataList[index];
        if (!data) {
          data = dataList[index] = { x: 0, y: 0, z: 0, u: 0, v: 0, color: Color.BLACK };
        }
        let y = bottom + i * stepY;
        let x = left + j * stepX;

        data.x = x;
        data.y = y;
        index++;
      }
    }

    renderData.dataLength = rows * cols;
    renderData.vertDirty = true;
  },

  // 更新计算uv
  updateUVs(sprite: VertSprite) {
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
    const uv_h = uv_t - uv_b;

    const uiTrans = sprite.node._uiProps.uiTransformComp!;
    const dataList: IRenderData[] = renderData.data;
    const cw = uiTrans.width;
    const ch = uiTrans.height;
    const appX = uiTrans.anchorX * cw;
    const appY = uiTrans.anchorY * ch;

    // 用相对坐标，计算uv
    for (let i = 0; i < renderData.dataLength; i++) {
      vData[i * renderData.floatStride + 3] =
        uv_l + ((dataList[i].x + appX) / cw) * uv_w;
      vData[i * renderData.floatStride + 4] =
        uv_b + ((dataList[i].y + appY) / ch) * uv_h;
    }
  },

  // 照抄，不用改
  updateColor(sprite: VertSprite) {
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

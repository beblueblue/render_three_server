import * as Designer from './action-type';

let defaultState = {
    /**
     * sku设计面数据
     * @type {Array}
     * example: [{
     *  name: 'A',
     *  id: 1,
     *  img: '/img/print/p1.jpg',
     *  width: 300,
     *  height: 300,
     *  // 旋转角度
     *  angle: 0,
     *  // 水平镜像
     *  flipX: false,
     *  // 垂直镜像
     *  flipY: false,
     *  // 绘制起点
     *  left: 90,
     *  top: 76,
     * }]
     */
    faceConfigList: [],

    // 当前操作的图像ID
    selectedImgId: 1,
    // 完整的纹理图，由canvas转化
    UVMap: null,
    // 是否显示UV映射关系图
    showUVBackground: true,

}

export const changeUV = (state = defaultState, action) => {
    switch (action.type) {
        case Designer.GETCONFIG:
            return { ...state, ...{ faceConfigList: action.faceConfigList } };
            break;
        case Designer.SETIMGID:
            return { ...state, ...{ selectedImgId: action.selectedImgId } };
                break;
        case Designer.UPDATEUV:
                return { ...state, ...{ UVMap: action.UVMap }};
            break;
        case Designer.TOGGLEUVBG:
                return { ...state, ...{ showUVBackground: action.showUVBackground }};
            break;
        default:
            return state;
    }
}
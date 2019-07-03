import * as ProductDetail from './action-type';

let defaultState = {
    /**
     * 配置数据
     * @type {Array}
     * example: {
     *    camera: {
     *          x,
     *          y,
     *          z
     *      },
     *    target: {
     *          x,
     *          y,
     *          z
     *      }
     * }
     */
    configMap: {
        camera: null,
        target: null
    },
    // 是否重置为初始视角
    resetViewFlag: false,
    // 触发配置数据保存事件
    fireUpdateViewFlag: false,
}

export const productDetailStore = (state = defaultState, action) => {
    switch (action.type) {
        case ProductDetail.RESETVIEW:
            return { ...state, ...{ resetViewFlag: action.resetViewFlag } };
            break;
        case ProductDetail.FIREUPDATE:
            return { ...state, ...{ fireUpdateViewFlag: action.fireUpdateViewFlag } };
            break;
        case ProductDetail.UPDATECONFIG:
            return { ...state, ...{ configMap: action.configMap } };
            break;
        default:
            return state;
    }
}
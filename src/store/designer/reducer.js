import * as Designer from './action-type';

let defaultState = {
    /**
     * sku设计面数据
     * @type {Array}
     * example: [{
     *      
     * }]
     */
    faceConfigList: [],
    // 当前操作的图像ID
    selectedImgId: 4,

    faceImgs: {},

    // 完整的纹理图，由canvas转化
    UVMap: null,
}

export const changeUV = (state = defaultState, action) => {
    switch (action.type) {
        case Designer.GETCONFIG:
            return { ...state, ...{ faceConfigList: action.faceConfigList } };
            break;
        case Designer.SETIMGID:
            return { ...state, ...{ selectedImgId: action.selectedImgId } };
                break;
        case Designer.ADDFACEIMG:
            let faceImg = {};
            let faceImgs;

            faceImg[action.ID] = faceImg;
            faceImgs = { ...state.faceImgs, faceImg };

            return { ...state, faceImgs};
                break;
        case Designer.UPDATEUV:
                return { ...state, ...{ UVMap: action.UVMap }};
            break;
        default:
            return state;
    }
}
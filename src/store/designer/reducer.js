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

    faceImgs: {}
}

export const changeUV = (state = defaultState, action) => {
    switch (action.type) {
        case Designer.GETCONFIG:
            return { ...state, ...{faceConfigList: action.faceConfigList} };
            break;
        case Designer.SETIMGID:
            return { ...state, ...{selectedImgId: action.selectedImgId}};
                break;
        case Designer.ADDFACEIMG:
            let faceImg = {};
            let faceImgs;

            faceImg[action.ID] = faceImg;
            faceImgs = { ...state.faceImgs, faceImg };

            return { ...state, faceImgs};
                break;
        default:
            return state;
    }
}
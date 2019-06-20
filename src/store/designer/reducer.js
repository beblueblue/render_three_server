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
    selectedImgId: 1
}

export const changeUV = (state = defaultState, action) => {
    console.log(action)
    switch (action.type) {
        case Designer.GETCONFIG:
            return { ...state, ...{faceConfigList: action.faceConfigList} };
            break;
        case Designer.SETIMGID:
            return { ...state, ...{selectedImgId: action.selectedImgId}};
                break;
        default:
            return state;
    }
}
import * as Designer from './action-type';

// 初始化sku中设计面配置，保存到redux
export const getConfig = (list) => {
    return {
        type: Designer.GETCONFIG,
        faceConfigList: list
    }
}

// 更改选中面ID
export const selectImgId = (ID) => {
    return{
        type: Designer.SETIMGID,
        selectedImgId: ID
    }
}
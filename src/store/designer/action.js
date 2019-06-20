import * as Designer from './action-type';

// 初始化sku中设计面配置，保存到redux
export const getConfig = (faceConfigList) => {
    return {
        type: Designer.GETCONFIG,
        faceConfigList
    }
}

// 更改选中面ID
export const selectImgId = (selectedImgId) => {
    return{
        type: Designer.SETIMGID,
        selectedImgId
    }
}

// 面图像导入
export const addFaceImg = (ID, faceImg) => {
    return {
        type: Designer.ADDFACEIMG,
        ID,
        faceImg,
    }
}
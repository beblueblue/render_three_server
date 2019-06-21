import * as Designer from './action-type';

// 初始化sku中设计面配置，保存到redux
export const getConfig = (faceConfigList) => {
    return {
        type: Designer.GETCONFIG,
        faceConfigList
    }
}

// 更改选中面ID
export const selectImgId = (selectedImgId) => (dispatch, getState) => {
    const { changeUV } = getState();

    if (selectedImgId !== changeUV.selectedImgId) {
        dispatch({
            type: Designer.SETIMGID,
            selectedImgId
        });
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

// 更新纹理图
export const updateUV = (UVmap) => (dispatch, getState) => {
    const { changeUV } = getState();

    if (UVmap !== changeUV.UVmap) {
        dispatch({
            type: Designer.UPDATEUV,
            UVmap
        });
    }
}
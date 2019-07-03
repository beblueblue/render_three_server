import * as ProductDetail from './action-type';

// 重置初始视角
export const resetOriginView = (resetViewFlag) => {
    return {
        type: ProductDetail.RESETVIEW,
        resetViewFlag
    }
}

// 更新配置
export const updateConfig = (configMap) => {
   return {
        type: ProductDetail.UPDATECONFIG,
        configMap
    }
}
// 触发更新配置
export const fireUpdateConfig = (fireUpdateViewFlag) => {
   return {
        type: ProductDetail.FIREUPDATE,
        fireUpdateViewFlag
    }
}
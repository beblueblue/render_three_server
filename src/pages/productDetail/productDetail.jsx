import './productDetail.less';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as actions from '@/store/productDetail/action';
import { connect } from 'react-redux';

import ModelPreview from '@/components/ModelPreview/ModelPreview.jsx';

const UVMap = 'static/imgs/cupMap-demo.png';
const modelURL = '/static/models/cupModel.obj';

class ProductDetail extends Component {
    constructor(props) {
        super(props);

        this.model = modelURL;
        this.UVMap = UVMap;
    }
    render(){
        let { resetOriginView, fireUpdateConfig, updateConfig, productDetailStore } = this.props
        const camera = productDetailStore.configMap.camera;
        const target = productDetailStore.configMap.target;
        return (
            <div className="designer-box mt20">
                <h1 className="pl20 tc">效果图采样</h1>
                <div className="detail-mix-wrap display-flex mt10">
                    <div className="modele-previewer-box">
                        <ModelPreview {
                                ...{ 
                                    model: this.model, 
                                    UVMap: this.UVMap,
                                    width: 600,
                                    height: 600,
                                    resetViewFlag: productDetailStore.resetViewFlag,
                                    fireUpdateViewFlag: productDetailStore.fireUpdateViewFlag,
                                    resetOriginView,
                                    updateConfig,
                                    fireUpdateConfig
                                }
                              }
                        /></div>
                    <div className="control-config-box">
                        <div>
                            <div><a className="main-btn-b" onClick={ () => { fireUpdateConfig(true) } }>{camera ? '更新' : '新增'}配置</a></div>
                            <div><a className="main-btn-b mt10" onClick={ () => { resetOriginView(true) } }>复位初始视角</a></div>
                        </div>
                        {
                            camera ? <div className="mt10">
                                        <p>相机位置：<br/>
                                            x: {camera.x}, <br/>
                                            y: {camera.y}, <br/>
                                            z: {camera.z}
                                        </p>
                                        <p>视点位置：<br/>
                                            x: {target.x}, <br/>
                                            y: {target.y}, <br/>
                                            z: {target.z
                                        }</p>
                                    </div>
                                : ''
                        }
                    </div>
                </div>
            </div>
        );
    }
}
ProductDetail.propTypes = {
    productDetailStore: PropTypes.shape({
        configMap: PropTypes.shape({
            camera: PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired,
                z: PropTypes.number.isRequired,
            }),
            target: PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired,
                z: PropTypes.number.isRequired,
            }),
        }).isRequired,
        resetViewFlag: PropTypes.bool.isRequired,
        fireUpdateViewFlag: PropTypes.bool.isRequired,
    }).isRequired,
    resetOriginView: PropTypes.func.isRequired,
    fireUpdateConfig: PropTypes.func.isRequired,
    updateConfig: PropTypes.func.isRequired,
}

export default connect(
    state => ({
        productDetailStore: state.productDetailStore,
    }),
    actions,
)(ProductDetail);
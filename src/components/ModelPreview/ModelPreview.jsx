import React, {Component} from 'react';
import THREE from 'three';

/**
 * 3D模型展示组件
 */
export default class ModelPreview extends Component {
    render(){
        return (
            <canvas className={`${this.props.className || ''}`}></canvas>
        );
    }
}
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

class Home extends Component {
    render() {
        return (
            <div className="pt20 pl20">
                <h1>ZW_3D_DEMO</h1>
                <Link className="blue" to="/designer">
                    <h2 className="pt10">环节一: 模型UV映射与生产面数据设定</h2>
                </Link>
                <Link className="blue" to="/designer">
                    <h2 className="pt10">环节一设计区域设定</h2>
                </Link>
            </div>
        );
    }
}

export default Home;
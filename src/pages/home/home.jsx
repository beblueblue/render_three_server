import React, {Component} from 'react';
import {Link} from 'react-router-dom';

class Home extends Component {
    render() {
        return (
            <div>
                <h1>ZW_3D_DEMO</h1>
                <Link className="blue" to="/designer">设计区域设定</Link>
            </div>
        );
    }
}

export default Home;
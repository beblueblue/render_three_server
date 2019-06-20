// 全局样式
import './common/style/base.css';
import 'font-awesome/css/font-awesome.css';

import React from 'react';
import ReactDOM from 'react-dom';

import RouterIndex from './router/index.js';
import { Provider } from 'react-redux';
import store from '@/store/store';

ReactDOM.render(
    // 绑定redux
    <Provider store={store}>
        <RouterIndex />
    </Provider>,
    document.getElementById('app')
);

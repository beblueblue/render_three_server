import React, {Component} from 'react';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';
import asyncComponent from '@/utils/asyncComponent';

import Home from "@/pages/home/home";
// 异步组件
const Designer = asyncComponent(() => import("@/pages/designer/designer"));
// import designer from '@/pages/designer/designer';

// const Designer = asyncComponent(() => designer);

class RouterIndex extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route path="/" exact render={() => ( <Redirect to="/home" /> )} />
                    <Route path="/home" component={Home} />
                    <Route path="/designer" component={Designer} />
                </Switch>
            </BrowserRouter>
        );
    }
}
export default RouterIndex;
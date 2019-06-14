import React, {Component} from 'react';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';

import Home from "../pages/home/home.jsx";
import Designer from "../pages/designer/designer.jsx";

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
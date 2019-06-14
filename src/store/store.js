import {createStore, applyMiddleware, bindActionCreators} from 'redux';
import thunk from 'react-thunk';

let store = createStore(
    applyMiddleware(thunk)
);

export default store;
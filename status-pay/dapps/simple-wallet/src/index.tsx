import React from 'react';
import ReactDOM from 'react-dom';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux'
import {
  createStore,
  applyMiddleware,
  Middleware,
  MiddlewareAPI,
  Dispatch,
} from 'redux'
import { initializeWeb3 } from './actions/web3';
import { createRootReducer } from './reducers'
import 'typeface-roboto';
import App from './containers/App';

// FIXME: remove, use a built-in one
interface Action {
  (...args: any[]): any
}

const loggerMiddleware: Middleware = ({ getState }: MiddlewareAPI) => (
    next: Dispatch
  ) => action => {
    console.log('will dispatch', action)

    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action)

    console.log('state after dispatch', getState())

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue
  }


let middlewares: Middleware[] = [
  thunkMiddleware,
];

if (process.env.NODE_ENV !== 'production') {
  middlewares = [
    ...middlewares,
    loggerMiddleware,
  ];
}

const store = createStore(
  createRootReducer(),
  applyMiddleware(...middlewares),
);

store.dispatch<any>(initializeWeb3());

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

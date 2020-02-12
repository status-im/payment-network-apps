import EmbarkJS from 'Embark/EmbarkJS';
import React from 'react';
import ReactDOM from 'react-dom';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { enableEthereum } from './actions';
import rootReducer from './reducers'

import 'typeface-roboto';

import { install } from '@material-ui/styles';
install();

import App from './containers/App';

const logger = (store) => {
  return (next) => {
    return (action) => {
        console.log('dispatching\n', action);
        const result = next(action);
        console.log('next state\n', store.getState());
        return result;
    }
  }
};

let middlewares = [
  thunkMiddleware,
];

if (process.env.NODE_ENV !== 'production') {
  middlewares = [
    ...middlewares,
    logger
  ];
}

const store = createStore(rootReducer,
  applyMiddleware(...middlewares),
);

store.dispatch(enableEthereum());

EmbarkJS.onReady(() => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("root")
  );
});

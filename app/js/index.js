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

import App from './components/App';

const store = createStore(rootReducer,
  applyMiddleware(
    thunkMiddleware
  )
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

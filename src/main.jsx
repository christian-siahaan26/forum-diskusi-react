import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import { fetchCurrentUser } from './store/slices/authSlice';
import { getToken } from './utils/tokenHelper';
import './index.css';

// Auto-login
if (getToken()) {
  store.dispatch(fetchCurrentUser());
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);

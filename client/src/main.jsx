import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <--- Move Router here
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter> {/* <--- Wrap everything here */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AuthContextProvider from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthContextProvider>
            <App />
        </AuthContextProvider>
    </BrowserRouter>
);

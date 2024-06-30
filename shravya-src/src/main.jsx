import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import LoginForm from './Components/LoginForm/LoginForm.jsx';
import HomeGuest from './Components/Home/HomeGuest.jsx'
import About from './Components/About/About.jsx';
import Default from './Components/Default/Default.jsx';
import Signup from './Components/Signup/Signup.jsx';
import Home from './Components/Home/Home.jsx';
import { AuthProvider } from './Components/AuthContext.jsx';
import UserDetails from './Components/UserDetails/UserDetails.jsx';

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Default />,
      },
      {
        path: 'login',
        element: <LoginForm />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'homeguest',
        element: <HomeGuest />,
      },
      {
        path: 'about',
        element: <About />
      },

      {
        path: 'signup',
        element: <Signup />
      },
      {
        path: 'user-details',
        element: <UserDetails />
      },

    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);

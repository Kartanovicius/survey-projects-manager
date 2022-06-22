import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from './context/authContext'
import * as ROUTES from './constants/routes'
import ProtectedRoute, { ProtectedRouteProps } from './helpers/protected-route';
import Dashboard from './pages/Dashboard';
import Profile from './pages/AccountSettings';
import ReactLoading from 'react-loading';
import { Paper } from '@mui/material';
import ColorModeProvider from './styles/ColorModeContext';

const Signin = lazy(() => import('./pages/Signin'))
const Signup = lazy(() => import('./pages/Signup'))
const Main = lazy(() => import('./pages/Main'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  const { currentUser } = useAuth()
  const defaultProtectedRouteProps: Omit<ProtectedRouteProps, 'outlet'> = {
    isAuthenticated: currentUser,
    authenticationPath: ROUTES.SIGN_IN,
  };

  return (
    <ColorModeProvider>
      {currentUser !== undefined && 
      <Suspense fallback={
        <Paper sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <ReactLoading type='spinningBubbles' color='#1875d2' height={'10%'} width={'10%'}/>
        </Paper>
      }>
        <Routes>
          <Route path={ROUTES.SIGN_IN} element={
            <ProtectedRoute
            isAuthenticated={!currentUser}
            authenticationPath={ROUTES.MAIN}
            outlet={<Signin />}
            />
          } />
          <Route path={ROUTES.SIGN_UP} element={
            <ProtectedRoute
            isAuthenticated={!currentUser}
            authenticationPath={ROUTES.MAIN}
            outlet={<Signup />}
            />
          } />
          <Route path={ROUTES.MAIN} element={
            <ProtectedRoute
              {...defaultProtectedRouteProps}
              outlet={<Main />}
            />
          }>
            <Route path={ROUTES.MAIN} element={<Dashboard />}/>
            <Route path={ROUTES.ACCOUNTSETTINGS+':userid'} element={<Profile />}/>
          </Route>
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Suspense>}
    </ColorModeProvider>
  );
}

export default App;

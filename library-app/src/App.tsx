import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './redux/ReduxStore';
import HomePage from './pages/HomePage/HomePage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LayoutPage from './pages/LayoutPage/LayoutPage';
import { fetchUser } from './redux/slices/AuthenticationSlice';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import ResourcePage from './pages/ResourcePage/ResourcePage';
import AdminPage from './pages/AdminPage/AdminPage';
import type { ReactNode } from 'react';

function AdminRoute({ children, ready }: { children: ReactNode; ready: boolean }) {
  const loggedInUser = useSelector((state: RootState) => state.authentication.loggedInUser);
  if (!ready) return <p role="status">Checking your session...</p>;
  if (!loggedInUser || loggedInUser.type !== 'ADMIN' || !localStorage.getItem('authToken')) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const loggedInUser = useSelector((state: RootState) => state.authentication.loggedInUser);
  const dispatch: AppDispatch = useDispatch();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("authToken");

    if (userId && token && !loggedInUser) {
      dispatch(fetchUser({
        userId,
        property: 'loggedInUser'
      })).finally(() => setSessionReady(true));
    } else {
      if (!token) localStorage.removeItem('userId');
      setSessionReady(true);
    }
  }, [dispatch, loggedInUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* A path of / will default to LayoutPage */}
        <Route path='/' element={<LayoutPage />}>
          {/* All the different pages within the application */}
          <Route path='' element={<HomePage />} />
          <Route path='/catalog' element={<CatalogPage />} />
          <Route path='/resource/:barcode' element={<ResourcePage />} />
          <Route path='/profile/:userId' element={<ProfilePage />} />
          <Route path='admin' element={<AdminRoute ready={sessionReady}><AdminPage /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

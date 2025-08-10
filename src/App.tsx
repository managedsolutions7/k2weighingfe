import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import Login from '@/pages/Login';
import AppRoutes from '@/routes';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};
export default App;

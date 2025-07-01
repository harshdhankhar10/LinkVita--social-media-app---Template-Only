import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider} from './context/AuthContext.tsx';



createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
      <AuthProvider>               
            <App />
               </AuthProvider>
      <ToastContainer />
    </BrowserRouter>

)

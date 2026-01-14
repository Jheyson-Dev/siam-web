import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ContactFormPublic from './components/ContactFormPublic.jsx'
import { CompanyProvider } from './context/CompanyContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CompanyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/contacto" element={<ContactFormPublic />} />
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </CompanyProvider>
  </StrictMode>,
)

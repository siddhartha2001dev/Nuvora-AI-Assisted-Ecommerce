import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import store from './redux/store'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 2800,
            style: {
              background: '#121215',
              color: '#ffffff',
              border: '1px solid #27272a',
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.7)',
            },
            success: {
              iconTheme: {
                primary: '#ffffff',
                secondary: '#000000',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)

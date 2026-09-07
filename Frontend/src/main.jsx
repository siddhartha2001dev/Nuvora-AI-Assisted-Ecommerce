import { StrictMode, useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import toast, { Toaster, ToastBar } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import store from './redux/store'
import './index.css'
import App from './App.jsx'

/**
 * Mobile-friendly touch-swipeable Toast container
 * Allows user to swipe up or sideways with finger to immediately dismiss toast
 */
function SwipeableToast({ t }) {
  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    startPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - startPos.current.x;
    const deltaY = e.touches[0].clientY - startPos.current.y;
    // Allow dragging upwards or horizontally
    if (deltaY < 5 || Math.abs(deltaX) > 10) {
      setOffsetY(Math.min(0, deltaY));
      setOffsetX(deltaX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Dismiss if swiped up by > 25px or swiped sideways by > 45px
    if (offsetY < -25 || Math.abs(offsetX) > 45) {
      toast.dismiss(t.id);
    } else {
      setOffsetY(0);
      setOffsetX(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        opacity: isDragging ? Math.max(0.2, 1 - (Math.abs(offsetY) + Math.abs(offsetX)) / 140) : 1,
        transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease",
        touchAction: "pan-x pan-y",
      }}
      className="relative select-none cursor-pointer group"
      onClick={() => toast.dismiss(t.id)}
      title="Tap or swipe to dismiss"
    >
      <ToastBar toast={t} style={{ ...t.style }}>
        {({ icon, message }) => (
          <div className="flex items-center space-x-2.5 w-full min-w-0">
            {icon}
            <div className="flex-1 text-xs font-semibold leading-snug break-words pr-1">
              {message}
            </div>
            {/* Direct Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
              className="p-1 -mr-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </ToastBar>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          containerClassName="nuvora-toast-container"
          containerStyle={{
            top: 86,
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#121215',
              color: '#ffffff',
              border: '1px solid #27272a',
              borderRadius: '16px',
              padding: '12px 18px',
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
        >
          {(t) => <SwipeableToast t={t} />}
        </Toaster>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)

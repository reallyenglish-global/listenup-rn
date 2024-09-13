import React, { useState, useEffect, useCallback } from 'react';

const NotificationStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    maxWidth: '400px',
    width: '100%',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  title: {
    margin: 0,
    fontSize: '1.2em',
    fontWeight: 'bold',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5em',
    cursor: 'pointer',
    padding: '0',
    color: '#666',
  },
  message: {
    marginBottom: '15px',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
};

const typeStyles = {
  success: {
    title: { color: '#4CAF50' },
    button: { backgroundColor: '#4CAF50', color: 'white' },
  },
  error: {
    title: { color: '#f44336' },
    button: { backgroundColor: '#f44336', color: 'white' },
  },
  info: {
    title: { color: '#2196F3' },
    button: { backgroundColor: '#2196F3', color: 'white' },
  },
  warning: {
    title: { color: '#ff9800' },
    button: { backgroundColor: '#ff9800', color: 'white' },
  },
};

const PopupNotification = ({ title, message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Delay to allow fade-out animation
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div style={{
      ...NotificationStyles.overlay,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out',
    }}>
      <div style={NotificationStyles.container}>
        <div style={NotificationStyles.header}>
          <h3 style={{...NotificationStyles.title, ...typeStyles[type].title}}>{title}</h3>
          <button onClick={handleClose} style={NotificationStyles.closeButton}>&times;</button>
        </div>
        <p style={NotificationStyles.message}>{message}</p>
        <button 
          onClick={handleClose} 
          style={{...NotificationStyles.button, ...typeStyles[type].button}}
        >
          OK
        </button>
      </div>
    </div>
  );
};

// Context for managing notifications
const NotificationContext = React.createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((title, message, type = 'info') => {
    setNotification({ title, message, type });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <PopupNotification
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Example usage
const App = () => {
  return (
    <NotificationProvider>
      <ExampleComponent />
    </NotificationProvider>
  );
};

const ExampleComponent = () => {
  const { showNotification } = useNotification();

  const handleClick = (type) => {
    showNotification(
      `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
      `This is a ${type} message!`,
      type
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Pop-up Notification Example</h1>
      <button onClick={() => handleClick('success')} style={{ marginRight: '10px' }}>Show Success</button>
      <button onClick={() => handleClick('error')} style={{ marginRight: '10px' }}>Show Error</button>
      <button onClick={() => handleClick('info')} style={{ marginRight: '10px' }}>Show Info</button>
      <button onClick={() => handleClick('warning')}>Show Warning</button>
    </div>
  );
};

export default PopupNotification;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ListeningSession } from '../services/ListeningSession';

interface SessionContextType {
  session: ListeningSession | null;
}

const SessionContext = createContext<SessionContextType>({ session: null });

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<ListeningSession | null>(null);

  useEffect(() => {
    const initSession = async () => {
      const newSession = new ListeningSession();
      await newSession.loadProgress();
      setSession(newSession);
    };

    initSession();
  }, []);

  //console.log('SessionProvider render - isLoading:', isLoading, 'session:', session, 'error:', error);

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
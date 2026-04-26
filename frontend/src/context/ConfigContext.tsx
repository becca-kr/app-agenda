import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

interface ConfigContextData {
  primaryColor: string;
  logoUrl: string | null;
  footerText: string;
}

const ConfigContext = createContext<ConfigContextData>({} as ConfigContextData);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState({
    primaryColor: '#0057FF',
    logoUrl: null,
    footerText: '© 2026 Todos os direitos reservados'
  });

  useEffect(() => {
    api.get('/settings')
      .then(response => {
        const { primaryColor, companyLogo, footerText } = response.data;
        setConfig({ primaryColor, logoUrl: companyLogo, footerText });
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        
        document.title = "Sala de Reunião | AllBec"; 

        const favicon = document.getElementById('favicon') as HTMLLinkElement;
        if (favicon && companyLogo) {
          favicon.href = companyLogo;
        }
        
        // --------------------------------------
      })
      .catch(error => console.error("Erro ao carregar configurações globais:", error));
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
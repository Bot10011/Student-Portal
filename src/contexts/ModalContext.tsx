import React, { createContext, useContext, useState, ReactNode } from 'react';

type ModalType = 'default' | 'course' | 'subject' | 'accessDenied';

interface ModalContextType {
  isModalOpen: boolean;
  modalType: ModalType;
  modalMessage: string;
  openModal: (type?: ModalType, message?: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('default');
  const [modalMessage, setModalMessage] = useState('');

  const openModal = (type: ModalType = 'default', message: string = '') => {
    setModalType(type);
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('default');
    setModalMessage('');
  };

  return (
    <ModalContext.Provider value={{ isModalOpen, modalType, modalMessage, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}; 
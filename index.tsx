
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PaymentModal from './components/PaymentModal';
import "./style.css";

const PaymentController = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        const handleClose = () => setIsOpen(false);

        window.addEventListener('open-payment-modal', handleOpen);
        window.addEventListener('close-payment-modal', handleClose);

        (window as any).openPaymentModal = () => setIsOpen(true);

        return () => {
            window.removeEventListener('open-payment-modal', handleOpen);
            window.removeEventListener('close-payment-modal', handleClose);
        };
    }, []);

    return <PaymentModal isOpen={isOpen} onClose={() => setIsOpen(false)} plan="Starter" />;
};

const rootEl = document.getElementById('root');
if (rootEl) {
    ReactDOM.createRoot(rootEl).render(
        <React.StrictMode>
            <App />
            <PaymentController />
        </React.StrictMode>
    );
}

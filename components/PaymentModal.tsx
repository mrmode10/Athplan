
import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';

// Helper to get the key - robust against missing env var
const STRIPE_KEY = 'pk_test_51SmuhAQ1GzqUdEZwKyVpP4cVKagxyT0326FJpv7GhwRchYGuJdQVn9rZ6CHUmcdWSrAWRQTlDzqcZASTIsrDrHLU00vcf66qnP';
const stripePromise = loadStripe(STRIPE_KEY);

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CheckoutForm = ({ onClose }: { onClose: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL where the customer should be redirected after the payment.
                return_url: window.location.href,
            },
            redirect: 'if_required'
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message ?? "An error occurred.");
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else {
            setMessage("Payment successful!");
            // Optionally verify with backend here
            setTimeout(onClose, 2000);
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
            <div className="flex justify-between items-center mt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    disabled={isLoading || !stripe || !elements}
                    id="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span id="button-text">
                        {isLoading ? <div className="spinner" id="spinner">Processing...</div> : "Pay now"}
                    </span>
                </button>
            </div>
            {message && <div id="payment-message" className="text-center text-sm mt-2 text-slate-300">{message}</div>}
        </form>
    );
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        if (isOpen) {
            // Fetch the PaymentIntent client secret from our Supabase Edge Function
            const fetchClientSecret = async () => {
                try {
                    const { data, error } = await supabase.functions.invoke('payment-sheet');

                    if (error) {
                        console.error('Error invoking function:', error);
                        // Fallback for demo/testing if function fails or doesn't exist locally
                        console.warn("Using mock client secret for UI demonstration.");
                        // NOTE: A real client secret is required for Elements to render. 
                        // If the function fails, the form won't load.
                        return;
                    }

                    if (data && data.paymentIntent) {
                        setClientSecret(data.paymentIntent);
                    }
                } catch (err) {
                    console.error("Fetch error:", err)
                }
            };

            fetchClientSecret();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const appearance = {
        theme: 'night' as const,
        variables: {
            colorPrimary: '#2563eb',
            colorBackground: '#0f172a',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.5)]" />

                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6 text-center">
                    Secure Payment
                </h2>

                {clientSecret ? (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm onClose={onClose} />
                    </Elements>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-slate-400">Initializing secure checkout...</p>
                        <p className="text-xs text-slate-500 max-w-xs text-center">
                            (If this hangs locally, ensure Supabase Edge Function is running)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

import type { RazorpayOptions } from '../types/razorpay';
import { toastNotifier } from '../utils/toast-notifier';

export const paymentService = {
    initiatePayment: (options: RazorpayOptions) => {
        if (!window.Razorpay) {
            console.error('Razorpay SDK not loaded');
            toastNotifier.show('Payment gateway is currently unavailable. Please refresh and try again.', 'error');
            return;
        }

        const rzp = new window.Razorpay(options);
        rzp.open();
    }
};

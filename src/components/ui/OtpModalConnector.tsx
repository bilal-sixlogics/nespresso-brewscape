"use client";

import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { OtpVerificationModal } from './OtpVerificationModal';

/**
 * Connects the OtpVerificationModal to AuthContext state.
 * Rendered once in the root layout, alongside LoginModal.
 */
export function OtpModalConnector() {
    const { user, isOtpModalOpen, closeOtpModal, verifyOtp, resendOtp } = useAuth();

    // verifyOtp in context already closes the modal and updates user state,
    // so onVerified is a no-op here.
    const handleVerified = useCallback(() => {}, []);

    return (
        <OtpVerificationModal
            isOpen={isOtpModalOpen}
            onClose={closeOtpModal}
            onVerify={verifyOtp}
            onResend={resendOtp}
            onVerified={handleVerified}
            email={user?.email ?? ''}
        />
    );
}

import React, { useRef, useEffect } from 'react';
import './modal.css';

export const Modal = ({ isOpen, sound, hasCloseBtn = false, onClose, children }) => {
    const modalRef = useRef(null);

    const handleCloseModal = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            handleCloseModal();
        }
    };

    useEffect(() => {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        if (isOpen) {
            modalElement.showModal();
        } else {
            modalElement.close();
        }
    }, [isOpen]);

    const handleCloseIfSame = (e) => {
        if (e.target === e.currentTarget) {
            handleCloseModal();
        }
    }



    return (
        <dialog ref={modalRef} onKeyDown={handleKeyDown} className="modal" onClick={handleCloseIfSame}>
            {hasCloseBtn && (
                <button className="modal-close-btn" onClick={handleCloseModal}>
                    Close
                </button>
            )}
            {children}
        </dialog>
    );
};

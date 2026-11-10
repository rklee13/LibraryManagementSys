import type { JSX } from 'react/jsx-runtime';
import './Modal.css';

interface ModalProps {
    // Pass in as custom props to control the modal's visibility and content based on the parent component's state
    toggleModal(): void;
    content: JSX.Element | null;
}

export const Modal: React.FC<ModalProps> = ({ toggleModal, content }) => {
    return (
        <div className="modal-bg">
            <div className="modal">
                <h5 className="modal-exit" onClick={toggleModal}>X</h5>
                {content}
            </div>
        </div>
    )
}
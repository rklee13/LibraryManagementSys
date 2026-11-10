import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../../../../components'
import './LoginRegisterModal.css';
import type { AppDispatch, RootState } from '../../../../redux/ReduxStore';
import { useEffect, useState } from 'react';
import { setDisplayLogin } from '../../../../redux/slices/ModalSlice';
import { LoginForm } from '../LoginForm/LoginForm';
import { RegisterForm } from '../RegisterForm/RegisterForm';

export const LoginRegisterModal: React.FC = () => {
    const authState = useSelector((state: RootState) => state.authentication);
    const dispatch: AppDispatch = useDispatch();

    const [login, setLogin] = useState<boolean>(true); // true by default, meaning the login form will be displayed initially

    const closeModal = () => {
        // Dispatch an action to close the modal
        dispatch(setDisplayLogin(false));
    }

    const toggleLogin = () => {
        // Shared modal between logging in & registering, so whenever login is true
        // it should show the login form; otherwise the register form
        setLogin(!login);
    }

    // Should re-run whenever logged in user changes (including logging in and out)
    useEffect(() => {
        // Automatically close modal if user is logged in already
        if (authState.loggedInUser) closeModal();

        return (() => {
            // Store the information into local storage (to check is someone is already logged in)
            if (authState.loggedInUser) {
                localStorage.setItem("userId", authState.loggedInUser._id);
            }
        })
    }, [authState.loggedInUser])

    return (
        <Modal
            content={login ? <LoginForm toggleRegister={toggleLogin} /> : <RegisterForm toggleLogin={toggleLogin} />}
            toggleModal={closeModal}
        />
    )
}
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/ReduxStore';
import { loginUser } from '../../../../redux/slices/AuthenticationSlice';

import './LoginForm.css';
import type { User } from '../../../../models/User';

interface LoginFormProps {
    toggleRegister(): void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ toggleRegister }) => {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    // Get initial state from the Redux store and also update the loggedInUser state in the parent component when a user logs in successfully
    const auth = useSelector((state: RootState) => state.authentication);
    const dispatch: AppDispatch = useDispatch();

    const handleLoginUser = async (event: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent the default form submission behavior
        event.preventDefault();
        if (emailRef && emailRef.current && passwordRef && passwordRef.current) {
            dispatch(loginUser({
                email: emailRef.current.value,
                password: passwordRef.current.value
            }));
        }
    };

    return (
        <form className="login-form">
            <h2>Please Login</h2>
            {auth.error ? <p className="login-form-error">Invalid email or password. Please try again.</p> : <></>}
            <div className="login-form-input-group">
                <h6>Email:</h6>
                <input className="login-form-input" placeholder="Enter your email" type="email" id="email" name="email" required ref={emailRef} />
            </div>
            <div className="login-form-input-group">
                <h6>Password:</h6>
                <input className="login-form-input" placeholder="Enter your password" type="password" id="password" name="password" required ref={passwordRef} />
            </div>
            <button className="login-form-submit-button" type="submit" onClick={handleLoginUser}>Login</button>
            <p>
                Don't have an account?
                {/* <a href="/signup">Sign up here</a> */}
                <span className="login-form-register" onClick={toggleRegister}>Sign up here</span>
            </p>
        </form>
    )
}
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import './UpdateuserForm.css';
import type { AppDispatch, RootState } from '../../../../redux/ReduxStore';
import type { User } from '../../../../models/User';
import { Create } from '@mui/icons-material';
import { resetUser, updateUser } from '../../../../redux/slices/AuthenticationSlice';

export const UpdateUserForm: React.FC = () => {
    const userState = useSelector((state: RootState) => state.authentication);
    const dispatch: AppDispatch = useDispatch();

    const [displayUpdate, setDisplayUpdate] = useState<boolean>(false);
    const [user, setUser] = useState<User | undefined>();

    const navigate = useNavigate();

    const updateUserState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayUpdate(true);
        if (event.target.value && event.target.name && user) {
            setUser({
                ...user,
                [event.target.name]: event.target.value
            });
        }
    }

    const submitUpdatedUser = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (user) dispatch(updateUser(user));
        setDisplayUpdate(false);
    }

    const logout = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        localStorage.removeItem("userId");
        dispatch(resetUser("loggedInUser"));
        dispatch(resetUser("profileUser"));
        navigate("/");
    }

    useEffect(() => {
        if (userState.profileUser) {
            // Make a deep copy of our profile user, so that whenever we modify things, it isn't messing with the state
            setUser(JSON.parse(JSON.stringify(userState.profileUser)));
        }
    }, [userState.profileUser?._id]);

    return (
        <form className='update-user-form'>
            <div className='update-user-input-group'>
                <h4>First Name:</h4>
                <input className='update-user-input' name='firstName' value={user?.firstName} onChange={updateUserState} disabled={userState.loggedInUser?._id !== userState.profileUser?._id} />
                {userState.loggedInUser?._id === userState.profileUser?._id && <Create sx={{
                    position: 'absolute',
                    top: '65%',
                    right: '0'
                }} />}
            </div>
            <div className='update-user-input-group'>
                <h4>Last Name:</h4>
                <input className='update-user-input' name='lastName' value={user?.lastName} onChange={updateUserState} disabled={userState.loggedInUser?._id !== userState.profileUser?._id} />
                {userState.loggedInUser?._id === userState.profileUser?._id && <Create sx={{
                    position: 'absolute',
                    top: '65%',
                    right: '0'
                }} />}
            </div>
            <div className='update-user-input-group'>
                <h4>Email:</h4>
                <input className='update-user-input' name='email' value={user?.email} onChange={updateUserState} disabled={userState.loggedInUser?._id !== userState.profileUser?._id} />
                {userState.loggedInUser?._id === userState.profileUser?._id && <Create sx={{
                    position: 'absolute',
                    top: '65%',
                    right: '0'
                }} />}
            </div>
            {displayUpdate ? <button className='profile-button' onClick={submitUpdatedUser}>Update Profile</button> : <></>}
            {userState.loggedInUser?._id === userState.profileUser?._id ? <button className='profile-button' onClick={logout}>Logout of Account</button> : <></>}
        </form>
    )
} 
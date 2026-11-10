import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import './ProfilePage.css';
import type { AppDispatch, RootState } from '../../redux/ReduxStore';
import { fetchUser } from '../../redux/slices/AuthenticationSlice';
import { ProfileLoanHistory, UpdateUserForm } from '../../features/profile';

export default function ProfilePage() {
    const loggedInUser = useSelector((state: RootState) => state.authentication.loggedInUser);
    const profileUser = useSelector((state: RootState) => state.authentication.profileUser);

    const dispatch: AppDispatch = useDispatch();

    const { userId } = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            // If the user Id is the current logged in user OR the logged in user is an employee
            // that can view other profiles, grab and update the information whenever the profile (userId) changes
            if (loggedInUser?._id === userId || loggedInUser?.type === 'EMPLOYEE') {
                dispatch(fetchUser({
                    userId,
                    property: 'profileUser'
                }));
            } else {
                // Otherwise, the logged in user should not be viewing this profile, so go to the home page
                navigate("/");
            }
        }
    }, [userId]);

    return (
        <div className="page">
            <div className='page-container'>
                <h1>{profileUser?.firstName} {profileUser?.lastName}'s Profile</h1>
                <div className="profile-page-cols">
                    <div className='profile-page-left-column'>
                        <UpdateUserForm />
                    </div>
                    <div className='profile-page-right-column'>
                        {profileUser && <ProfileLoanHistory />}
                    </div>
                </div>
            </div>
        </div>
    )
}
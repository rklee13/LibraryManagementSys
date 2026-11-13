import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/ReduxStore';
import { clearAdminFeedback, fetchAdminUsers } from '../../redux/slices/AdminSlice';
import { AddUserForm } from '../../features/admin/components/AddUserForm/AddUserForm';
import { UserManagementTable } from '../../features/admin/components/UserManagementTable/UserManagementTable';
import './AdminPage.css';

export default function AdminPage() {
    const dispatch: AppDispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => state.authentication.loggedInUser);
    const adminState = useSelector((state: RootState) => state.admin);

    useEffect(() => {
        dispatch(clearAdminFeedback());
        dispatch(fetchAdminUsers());
    }, [dispatch]);

    return (
        <div className="page">
            <div className="page-container admin-page-container">
                <header className="admin-page-header">
                    <p className="admin-page-eyebrow">Library operations</p>
                    <h1>User management</h1>
                    <p>Manage librarian and patron accounts across your library.</p>
                </header>

                {adminState.error && <p className="admin-feedback-error" role="alert">{adminState.error}</p>}
                {adminState.successMessage && <p className="admin-feedback-success" role="status">{adminState.successMessage}</p>}

                <section className="admin-panel" aria-labelledby="admin-add-title">
                    <div className="admin-section-heading">
                        <div>
                            <p className="admin-section-kicker">New account</p>
                            <h2 id="admin-add-title">Add a user</h2>
                        </div>
                    </div>
                    <AddUserForm />
                </section>

                <section className="admin-panel" aria-labelledby="admin-user-list-title">
                    <div className="admin-section-heading">
                        <div>
                            <p className="admin-section-kicker">Directory</p>
                            <h2 id="admin-user-list-title">Library users</h2>
                        </div>
                        <span className="admin-user-count">{adminState.users.length} total</span>
                    </div>
                    {adminState.loading ? (
                        <p className="admin-loading" role="status">Loading users...</p>
                    ) : (
                        <UserManagementTable users={adminState.users} currentUserId={currentUser?._id || ''} />
                    )}
                </section>
            </div>
        </div>
    );
}

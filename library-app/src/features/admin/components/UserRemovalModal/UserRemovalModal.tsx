import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../../../../components/Modal/Modal';
import type { AppDispatch, RootState } from '../../../../redux/ReduxStore';
import { deleteManagedUser } from '../../../../redux/slices/AdminSlice';
import { setUserRemovalTarget } from '../../../../redux/slices/ModalSlice';
import './UserRemovalModal.css';

export function UserRemovalModal() {
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector((state: RootState) => state.modal.userToRemove);
    const { deletingUserId, error } = useSelector((state: RootState) => state.admin);

    if (!user) return null;

    const close = () => dispatch(setUserRemovalTarget(null));
    const confirmRemoval = async () => {
        const result = await dispatch(deleteManagedUser(user._id));
        if (deleteManagedUser.fulfilled.match(result)) close();
    };

    return (
        <Modal toggleModal={close} content={
            <div className="admin-removal-dialog">
                <p className="admin-dialog-eyebrow">Remove account</p>
                <h2>Remove {user.firstName} {user.lastName}?</h2>
                <p>This account will no longer be able to sign in. This action cannot be undone.</p>
                {error && <p className="admin-feedback-error" role="alert">{error}</p>}
                <div className="admin-removal-actions">
                    <button className="admin-secondary-button" type="button" onClick={close}
                        disabled={deletingUserId === user._id}>Cancel</button>
                    <button className="admin-danger-button" type="button" onClick={confirmRemoval}
                        disabled={deletingUserId === user._id}>
                        {deletingUserId === user._id ? 'Removing...' : 'Remove account'}
                    </button>
                </div>
            </div>
        } />
    );
}

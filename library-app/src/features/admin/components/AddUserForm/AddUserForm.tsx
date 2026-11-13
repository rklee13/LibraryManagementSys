import { useState, type SubmitEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/ReduxStore';
import { clearAdminFeedback, createManagedUser } from '../../../../redux/slices/AdminSlice';
import type { ManagedUserPayload } from '../../../../models/User';
import './AddUserForm.css';

const initialForm: ManagedUserPayload = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    type: 'EMPLOYEE'
};

export function AddUserForm() {
    const dispatch: AppDispatch = useDispatch();
    const { creating } = useSelector((state: RootState) => state.admin);
    const [form, setForm] = useState(initialForm);

    const updateField = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        if (name === 'type') {
            setForm((current) => ({ ...current, type: value as ManagedUserPayload['type'] }));
            return;
        }
        setForm((current) => ({ ...current, [name]: value }));
    };

    const submit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        dispatch(clearAdminFeedback());
        const result = await dispatch(createManagedUser(form));
        if (createManagedUser.fulfilled.match(result)) {
            setForm(initialForm);
        }
    };

    return (
        <form className="admin-add-form" onSubmit={submit}>
            <label>
                First name
                <input name="firstName" value={form.firstName} onChange={updateField}
                    minLength={2} maxLength={100} autoComplete="given-name" required />
            </label>
            <label>
                Last name
                <input name="lastName" value={form.lastName} onChange={updateField}
                    minLength={2} maxLength={100} autoComplete="family-name" required />
            </label>
            <label>
                Email
                <input name="email" type="email" value={form.email} onChange={updateField}
                    autoComplete="email" required />
            </label>
            <label>
                Temporary password
                <input name="password" type="password" value={form.password} onChange={updateField}
                    minLength={8} maxLength={100} autoComplete="new-password" required />
            </label>
            <label>
                Role
                <select name="type" value={form.type} onChange={updateField}>
                    <option value="EMPLOYEE">Librarian</option>
                    <option value="PATRON">Patron</option>
                </select>
            </label>
            <button type="submit" className="admin-primary-button" disabled={creating}>
                {creating ? 'Adding...' : 'Add user'}
            </button>
        </form>
    );
}

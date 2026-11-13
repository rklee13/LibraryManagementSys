import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../redux/ReduxStore';
import type { User } from '../../../../models/User';
import { setUserRemovalTarget } from '../../../../redux/slices/ModalSlice';
import './UserManagementTable.css';

type RoleFilter = 'ALL' | User['type'];

interface UserManagementTableProps {
    users: User[];
    currentUserId: string;
}

function roleLabel(type: User['type']): string {
    switch (type) {
        case 'EMPLOYEE': return 'Librarian';
        case 'PATRON': return 'Patron';
        case 'ADMIN': return 'Admin';
    }
}

export function UserManagementTable({ users, currentUserId }: UserManagementTableProps) {
    const dispatch: AppDispatch = useDispatch();
    const [search, setSearch] = useState('');
    const [role, setRole] = useState<RoleFilter>('ALL');

    const visibleUsers = useMemo(() => {
        const query = search.trim().toLowerCase();
        return users.filter((user) => {
            const matchesRole = role === 'ALL' || user.type === role;
            const matchesSearch = !query ||
                `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(query);
            return matchesRole && matchesSearch;
        });
    }, [users, search, role]);

    return (
        <section className="admin-user-list" aria-labelledby="admin-user-list-title">
            <div className="admin-list-toolbar">
                <label>
                    <span className="visually-hidden">Search users</span>
                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name or email" />
                </label>
                <label className="admin-role-filter">
                    <span className="visually-hidden">Filter by role</span>
                    <select value={role} onChange={(event) => setRole(event.target.value as RoleFilter)}>
                        <option value="ALL">All roles</option>
                        <option value="ADMIN">Admins</option>
                        <option value="EMPLOYEE">Librarians</option>
                        <option value="PATRON">Patrons</option>
                    </select>
                </label>
            </div>
            {visibleUsers.length === 0 ? (
                <p className="admin-empty-state">No users match these filters.</p>
            ) : (
                <div className="admin-table-scroll">
                    <table className="admin-users-table">
                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Role</th>
                                <th scope="col"><span className="visually-hidden">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleUsers.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.firstName} {user.lastName}{user._id === currentUserId && <span className="admin-you-label">You</span>}</td>
                                    <td>{user.email}</td>
                                    <td><span className={`admin-role-badge admin-role-${user.type.toLowerCase()}`}>{roleLabel(user.type)}</span></td>
                                    <td className="admin-user-action">
                                        {user._id !== currentUserId && (
                                            <button type="button" className="admin-remove-button"
                                                onClick={() => dispatch(setUserRemovalTarget(user))}>
                                                Remove
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

import './LayoutPage.css';
import type { RootState } from '../../redux/ReduxStore';
import { LibraryCardModal, LoginRegisterModal } from '../../features/authentication';
import { Footer, Navbar } from '../../features/navigation';
import { LoanBookModal } from '../../features/book';

export default function LayoutPage() {
    // Extracts and read the modal state from the React-Redux store
    const state = useSelector((state: RootState) => state.modal);

    return (
        <div className='layout-page'>
            <a className="skip-link" href="#main-content">Skip to content</a>
            {state.displayLogin && <LoginRegisterModal />}
            {state.displayLibraryCard && <LibraryCardModal />}
            {state.displayLoan && <LoanBookModal />}
            <Navbar />
            <main className="layout-main" id="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
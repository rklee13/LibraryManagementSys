import React from 'react';

import './Footer.css';
import { Facebook, Instagram, Twitter, YouTube } from '@mui/icons-material';

export const Footer: React.FC = () => {
    return (
        <footer className='footer'>
            <p className='footer-text'>123 Library Street, TW 55555</p>
            <p className='footer-text'>Return Policy</p>
            <p className='footer-text'>Late Fees</p>
            <p className='footer-text'>Library Card Condition</p>
            <div className='footer-social-cluster' role="group" aria-label="Social media">
                <p className='footer-social-text'>Socials</p>
                <YouTube className='footer-social' aria-hidden="true" />
                <Twitter className='footer-social' aria-hidden="true" />
                <Facebook className='footer-social' aria-hidden="true" />
                <Instagram className='footer-social' aria-hidden="true" />
            </div>
        </footer>
    )
}
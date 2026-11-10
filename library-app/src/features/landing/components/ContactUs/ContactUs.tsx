import React from "react";

import './ContactUs.css';

export const ContactUs: React.FC = () => {
    return (
        <div className="contact-us">
            <h3>Contact Us</h3>
            <h4>Address:</h4>
            <p>123 Library Street</p>
            <p>Library, TW, 55555</p>
            <div className="contact-us-divider" />
            <h4>Phone Number:</h4>
            <p>555-555-5555</p>
            <div className="contact-us-divider" />
            <h4>Email:</h4>
            <p>mylibrary#lib.com</p>
        </div>
    )
}
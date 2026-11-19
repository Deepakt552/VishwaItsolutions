import React from 'react';
import { base } from './business';

export default function WhatsAppIcon({ variant = 'green', size = 22 }) {
    return (
        <img
            className="whatsapp-icon"
            src={`${base}brand/whatsapp-${variant}.svg`}
            alt=""
            aria-hidden="true"
            width={size}
            height={size}
        />
    );
}

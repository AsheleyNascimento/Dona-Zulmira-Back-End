import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outros
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
    },
    from: process.env.SMTP_FROM || 'Sistema Dona Zulmira <noreply@donazulmira.com.br>',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}));

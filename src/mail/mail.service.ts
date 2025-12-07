import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import mailConfig from './mail.config';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(
        @Inject(mailConfig.KEY)
        private readonly config: ConfigType<typeof mailConfig>,
    ) {
        this.transporter = nodemailer.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure,
            auth: this.config.auth,
        });
    }

    async sendPasswordResetEmail(
        email: string,
        token: string,
        userName: string,
    ): Promise<void> {
        const resetUrl = `${this.config.frontendUrl}/reset-password?token=${token}`;

        const mailOptions = {
            from: this.config.from,
            to: email,
            subject: 'Recuperação de Senha - Sistema Dona Zulmira',
            html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f4f4f4;
              border-radius: 10px;
              padding: 30px;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
              margin: -30px -30px 20px -30px;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 5px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background-color: #45a049;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 10px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperação de Senha</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${userName}</strong>!</p>
              
              <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Sistema Dona Zulmira</strong>.</p>
              
              <p>Para criar uma nova senha, clique no botão abaixo:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
              </div>
              
              <p>Ou copie e cole o seguinte link no seu navegador:</p>
              <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Atenção:</strong> Este link é válido por apenas <strong>1 hora</strong>. Após esse período, você precisará solicitar uma nova recuperação.
              </div>
              
              <p><strong>Não foi você?</strong> Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanecerá inalterada.</p>
            </div>
            
            <div class="footer">
              <p>Este é um e-mail automático. Por favor, não responda.</p>
              <p>&copy; ${new Date().getFullYear()} Sistema Dona Zulmira - Todos os direitos reservados</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        Olá, ${userName}!
        
        Recebemos uma solicitação para redefinir a senha da sua conta no Sistema Dona Zulmira.
        
        Para criar uma nova senha, acesse o seguinte link:
        ${resetUrl}
        
        ATENÇÃO: Este link é válido por apenas 1 hora.
        
        Se você não solicitou a redefinição de senha, ignore este e-mail.
        
        ---
        Sistema Dona Zulmira
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`E-mail de recuperação enviado para: ${email}`);
        } catch (error) {
            this.logger.error(
                `Erro ao enviar e-mail de recuperação para ${email}:`,
                error,
            );
            throw new Error('Falha ao enviar e-mail de recuperação');
        }
    }
}

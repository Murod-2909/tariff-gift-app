import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    family: 4,
    auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
    },
})

export async function sendActivationEmail(params: {
    to: string
    tariffName: string
    activationCode: string
}) {
    await transporter.sendMail({
        from: `"Tariff Gift App" <${process.env.SMTP_USER}>`,
        to: params.to,
        subject: 'Your gift has been approved! 🎁',
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Your gift request was approved!</h2>
        <p>Your gift for <strong>${params.tariffName}</strong> is ready to activate.</p>
        <p>Use the code below to activate it:</p>
        <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">
          ${params.activationCode}
        </div>
        <p>Go to the activation page and enter this code to unlock your tariff.</p>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">
          This code can only be used once.
        </p>
      </div>
    `,
    })
}
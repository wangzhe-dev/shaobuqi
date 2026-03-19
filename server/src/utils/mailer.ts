import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.qq.com',
  port: Number(process.env.MAIL_PORT || 465),
  secure: (process.env.MAIL_SECURE ?? 'true') === 'true',
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || ''
  }
})

export async function sendVerifyCode(to: string, code: string) {
  const fromName = process.env.MAIL_FROM_NAME || '烧不起'
  const fromAddr = process.env.MAIL_USER || ''

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddr}>`,
    to,
    subject: '【烧不起】邮箱验证码',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f7f8fa;border-radius:12px;">
        <h2 style="color:#1a1a2e;margin:0 0 8px;">验证码</h2>
        <p style="color:#6b7280;margin:0 0 24px;font-size:14px;">你正在注册烧不起账号，验证码 5 分钟内有效。</p>
        <div style="background:#fff;border-radius:8px;padding:24px;text-align:center;border:1px solid #e5e7eb;">
          <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#5B5BD6;">${code}</span>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">如非本人操作，请忽略此邮件。</p>
      </div>
    `
  })
}

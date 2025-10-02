import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface PriceDropAlert {
  userEmail: string
  productAsin: string
  productTitle: string
  oldPrice: number
  newPrice: number
  percentageChange: number
  marketplace: string
}

export async function sendPriceDropAlert(alert: PriceDropAlert) {
  const { userEmail, productAsin, productTitle, oldPrice, newPrice, percentageChange, marketplace } = alert

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: userEmail,
      subject: `Price Drop Alert: ${productTitle.substring(0, 50)}...`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Price Drop Detected!</h2>
          
          <p>The price of one of your tracked products has dropped:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${productTitle}</h3>
            <p><strong>ASIN:</strong> ${productAsin}</p>
            <p><strong>Marketplace:</strong> ${marketplace}</p>
            <p style="margin: 10px 0;">
              <span style="text-decoration: line-through; color: #6b7280;">$${oldPrice.toFixed(2)}</span>
              <span style="color: #16a34a; font-size: 24px; font-weight: bold; margin-left: 10px;">$${newPrice.toFixed(2)}</span>
            </p>
            <p style="color: #16a34a; font-weight: bold;">
              ${percentageChange.toFixed(1)}% price drop
            </p>
          </div>
          
          <a href="https://amazon-tracker-saas.vercel.app/dashboard" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Dashboard
          </a>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            You're receiving this because you have email alerts enabled for this product.
          </p>
        </div>
      `
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to send price drop alert:', error)
    return { success: false, error }
  }
}
export const THANK_YOU_CONTENT = {
  waitlist: {
    heading: "You're on the list!",
    message: "Thanks for joining the Brander Roller waitlist. We'll reach out personally before launch — keep an eye on your inbox and WhatsApp.",
    primary: { to: '/', label: 'Back to Home' },
    secondary: { to: '/shop/brander-roller', label: 'Back to Brander Roller' },
    conversionLabel: 'waitlist_signup',
  },
  order: {
    heading: 'Thanks for your order!',
    message: "We've received your details and will confirm pricing and next steps over WhatsApp shortly.",
    primary: { to: '/', label: 'Back to Home' },
    secondary: { to: '/shop', label: 'Keep Browsing' },
    conversionLabel: 'order_submitted',
  },
  contact: {
    heading: 'Message received!',
    message: "Thanks for reaching out — we'll get back to you within 24 hours.",
    primary: { to: '/', label: 'Back to Home' },
    secondary: { to: '/shop', label: 'Browse Shop' },
    conversionLabel: 'contact_form',
  },
  default: {
    heading: 'Thank you!',
    message: "We've received your submission and will be in touch shortly.",
    primary: { to: '/', label: 'Back to Home' },
    secondary: { to: '/shop', label: 'Browse Shop' },
    conversionLabel: 'form_submitted',
  },
}

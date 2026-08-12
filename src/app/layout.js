import { Poppins, Black_Ops_One } from 'next/font/google'
import Script from 'next/script'
import ContentProtection from '@/components/ContentProtection'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const blackOpsOne = Black_Ops_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-black-ops-one',
  display: 'swap',
})

const SITE = 'https://www.oric3d.com'

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: '3D Printing Service in Bangalore | ORIC',
    template: '%s | ORIC',
  },
  description:
    "Bangalore's 3D print-on-demand studio. Custom figurines, prototypes, parts and idols with FDM precision, no minimum order. Get a quote on WhatsApp.",
  authors: [{ name: 'ORIC' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE,
    siteName: 'ORIC',
    locale: 'en_IN',
    title: '3D Printing Service in Bangalore | ORIC',
    description:
      "Bangalore's 3D print-on-demand studio. Custom figurines, prototypes, parts and idols with FDM precision, no minimum order. Get a quote on WhatsApp.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '3D Printing Service in Bangalore | ORIC',
    description:
      "Bangalore's 3D print-on-demand studio. Custom figurines, prototypes, parts and idols with FDM precision, no minimum order.",
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/oriclogofav.svg',
    apple: '/oriclogofav.svg',
  },
  other: {
    'geo.region': 'IN-KA',
    'geo.placename': 'Bangalore, Karnataka, India',
    'geo.position': '12.9716;77.5946',
    ICBM: '12.9716, 77.5946',
  },
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Store'],
  '@id': `${SITE}/#business`,
  name: 'ORIC',
  alternateName: 'ORIC 3D Printing',
  description:
    'Premium 3D print-on-demand studio in Bangalore. Custom figurines, prototypes, functional parts, idols, toys and lithophanes. FDM printing with fast turnaround and delivery across India.',
  url: SITE,
  logo: `${SITE}/oriclogo1.svg`,
  image: `${SITE}/og-image.jpg`,
  dateModified: '2026-08-11',
  telephone: '+918310194953',
  email: 'support@oric3d.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bangalore',
    addressRegion: 'Karnataka',
    postalCode: '560001',
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 12.9716, longitude: 77.5946 },
  areaServed: [
    { '@type': 'City', name: 'Bangalore' },
    { '@type': 'State', name: 'Karnataka' },
    { '@type': 'Country', name: 'India' },
  ],
  serviceType: [
    '3D Printing Service',
    'Custom 3D Printing',
    'FDM Printing',
    '3D Printed Figurines',
    'Prototype Manufacturing',
    'Small Batch Manufacturing',
    'Lithophane Printing',
  ],
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'UPI, Bank Transfer, Cash',
  openingHours: 'Mo-Sa 09:00-19:00',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+918310194953',
    contactType: 'customer service',
    contactOption: 'TollFree',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi', 'Kannada'],
  },
  sameAs: ['https://wa.me/918310194953', 'https://www.instagram.com/oric3d/'],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: SITE,
  name: 'ORIC',
  description: '3D Print on Demand — Bangalore, India',
  inLanguage: 'en-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE}/shop?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE}/#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I place an order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Browse the Shop or send us a photo/file directly on WhatsApp. Add items to your cart and tap "Order via WhatsApp" to send us an itemized message — we confirm final pricing and payment details there. There\'s no separate online checkout; every order is confirmed personally over WhatsApp.',
      },
    },
    {
      '@type': 'Question',
      name: 'What file formats do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "We accept STL, STEP, and OBJ files for custom prints. No file? No problem — send a reference photo or describe your idea on WhatsApp and we'll help design it or quote it directly.",
      },
    },
    {
      '@type': 'Question',
      name: 'How is pricing calculated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For custom STL uploads, use the instant price configurator on our homepage — it factors in material, print quality, infill strength, and scale. For figurines, idols, and other "Get Quote" items, we review your request and send a fixed price within 24 hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you ship across India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — we deliver pan-India via Shiprocket/Delhivery. Bangalore orders typically cost ₹40–80 to ship; the rest of India ₹80–150. Exact shipping cost is confirmed at order time.',
      },
    },
    {
      '@type': 'Question',
      name: "What's your refund policy?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Defective or damaged prints are reprinted free of charge. See our full Refund & Reprint Policy for what qualifies and how to raise a request.',
      },
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${blackOpsOne.variable}`}>
      <body>
        {/* Meta Pixel noscript fallback (must be in body) */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=919514127746755&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <ContentProtection />
        {children}

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X6FS2V9JDQ"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X6FS2V9JDQ');
          `}
        </Script>
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '919514127746755');
            fbq('track', 'PageView');
          `}
        </Script>
      </body>
    </html>
  )
}

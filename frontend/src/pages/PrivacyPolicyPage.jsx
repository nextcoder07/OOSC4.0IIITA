import React from 'react'
import { Helmet } from 'react-helmet-async'
import './PolicyPage.css'

export default function PrivacyPolicyPage() {
  return (
    <section className="content-section policy-section">
      <Helmet>
        <title>Privacy Policy — OOSC 4.0 | IIIT Allahabad</title>
        <meta name="description" content="Read the privacy policy for the OOSC 4.0 Open Source Systems Conference at IIIT Allahabad. Learn how we collect, use, and protect your personal data." />
        <link rel="canonical" href="https://oosc.iiita.ac.in/privacy" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="policy-container glass-card">
        <h2>Privacy Policy</h2>
        <p className="policy-date">Effective Date: August 28, 2026</p>
        
        <h3>1. Information We Collect</h3>
        <p>We collect information you provide directly to us, such as when you register for the event, fill out a form, or communicate with us. This may include your name, email address, phone number, institution details, and any other information you choose to provide.</p>

        <h3>2. How We Use Your Information</h3>
        <p>We use the information we collect to manage your registration, provide you with event updates, and improve our services. We may also use this information to respond to your inquiries and support needs. We do not sell your personal data to third parties.</p>

        <h3>3. Data Security</h3>
        <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. We regularly review our security procedures to consider appropriate new technology and methods.</p>

        <h3>4. Sharing of Information</h3>
        <p>We may share your information with our sponsors or partners only if you explicitly opt-in during registration or at the event. Otherwise, your data is kept strictly confidential within the organizing committee.</p>

        <h3>5. Contact Us</h3>
        <p>If you have any questions about this Privacy Policy or how we handle your data, please contact us at contact@oosc4.0.iiita.ac.in.</p>
      </div>
    </section>
  )
}

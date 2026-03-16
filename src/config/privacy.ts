/**
 * Privacy Configuration
 * Centralized location for all privacy-related text and disclosures
 * Easy to edit and maintain for legal compliance
 */

import { PRIVACY_POLICY_URL, TERMS_URL } from '@env';

export const PrivacyConfig = {
  /**
   * Contact Privacy Disclosure
   * Shown when adding emergency contacts
   * Required by Apple for third-party data collection
   */
  contactDisclosure: {
    title: "Privacy & Consent",
    points: [
      "This email will ONLY be used for missed check-in alerts",
      "Emails are sent ONLY when you miss your scheduled check-in",
      "You can modify or delete contacts anytime in this app",
    ],
    consentCheckbox:
      "I confirm I have obtained consent from this person to use their email for emergency notifications",
  },

  /**
   * External Links
   * URLs are loaded from .env for easy configuration per environment
   */
  links: {
    // These are loaded from environment variables
    // Fallback to empty string if not configured
    privacyPolicyUrl: PRIVACY_POLICY_URL || "",
    termsUrl: TERMS_URL || "",
  },

  /**
   * Link Display Names
   * User-facing text for legal links
   */
  linkLabels: {
    privacyPolicy: "Privacy Policy",
    terms: "Terms of Service",
  },
};

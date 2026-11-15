import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Analycos",
  description: "The terms that apply when you use Analycos analytics and hit counters.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of terms",
    body: (
      <p>
        By creating an account or using Analycos you agree to these Terms and to our{" "}
        <a href="/privacy">Privacy Policy</a>. If you do not agree, do not use the service.
      </p>
    ),
  },
  {
    id: "service",
    title: "2. The service",
    body: (
      <p>
        Analycos provides website analytics, real-time visitor views, hit counters and related
        tools. Features may change, and we may add or remove features over time.
      </p>
    ),
  },
  {
    id: "account",
    title: "3. Your account",
    body: (
      <ul>
        <li>Provide accurate registration details and keep your password confidential.</li>
        <li>You are responsible for activity under your account.</li>
        <li>Tell us promptly if you suspect unauthorized access.</li>
      </ul>
    ),
  },
  {
    id: "acceptable-use",
    title: "4. Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Track websites you do not own or have permission to monitor.</li>
          <li>Send fake, automated or abusive traffic to our tracking endpoints, or try to disrupt the service.</li>
          <li>Attempt to access other users&apos; data, or probe or bypass security measures.</li>
          <li>Use the service for unlawful purposes, or to collect sensitive personal data through custom events.</li>
        </ul>
      </>
    ),
  },
  {
    id: "visitor-privacy",
    title: "5. Your visitors' privacy",
    body: (
      <p>
        You are responsible for disclosing your use of Analycos to your site&apos;s visitors and for
        obtaining any consent that applicable law requires (for example a privacy notice or cookie
        banner). You must not use the service to identify individual visitors in ways they would not
        reasonably expect.
      </p>
    ),
  },
  {
    id: "content",
    title: "6. Public stats and counters",
    body: (
      <p>
        If you make a website public or embed a hit counter, the shown statistics are visible to
        others. You are responsible for deciding what to publish and can change visibility in
        Settings at any time.
      </p>
    ),
  },
  {
    id: "availability",
    title: "7. Availability and data accuracy",
    body: (
      <p>
        We aim for reliable service but do not guarantee uninterrupted operation. Statistics can be
        affected by ad blockers, browser privacy settings, bots and network issues, so numbers are
        estimates rather than exact counts.
      </p>
    ),
  },
  {
    id: "termination",
    title: "8. Suspension and termination",
    body: (
      <p>
        You may stop using Analycos and delete your account at any time. We may suspend or terminate
        accounts that violate these Terms or put the service or other users at risk.
      </p>
    ),
  },
  {
    id: "liability",
    title: "9. Disclaimer and liability",
    body: (
      <p>
        The service is provided &quot;as is&quot; without warranties of any kind. To the extent the
        law allows, Analycos is not liable for indirect or consequential damages, or for loss of data,
        revenue or profits arising from use of the service.
      </p>
    ),
  },
  {
    id: "changes",
    title: "10. Changes and contact",
    body: (
      <p>
        We may update these Terms; continued use after a change means you accept it. Questions:{" "}
        <a href="mailto:support@analycos.com">support@analycos.com</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="The rules for using Analycos."
      updated="November 15, 2026"
      sections={sections}
    />
  );
}

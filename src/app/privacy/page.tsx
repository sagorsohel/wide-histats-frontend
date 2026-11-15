import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Analycos",
  description: "How Analycos collects, uses and protects account and visitor analytics data.",
  alternates: { canonical: "/privacy" },
};

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "1. Overview",
    body: (
      <p>
        Analycos is a web analytics service. Website owners (&quot;customers&quot;) add our tracking
        script to their sites and see visitor statistics in their dashboard. This policy explains what
        we collect from <strong>customers</strong> (account holders) and from <strong>visitors</strong>{" "}
        of tracked websites, and how we handle it. For visitor data we act as a processor on behalf of
        the customer, who is the controller of their own site&apos;s data.
      </p>
    ),
  },
  {
    id: "account-data",
    title: "2. Account data we collect",
    body: (
      <ul>
        <li>Name and email address you provide at registration.</li>
        <li>A password hash — we never store your password in plain text.</li>
        <li>Websites you add (name, domain, tracking ID, visibility and counter settings).</li>
        <li>Sign-in tokens (see Cookies below) and refresh-token records used to keep you signed in.</li>
      </ul>
    ),
  },
  {
    id: "visitor-data",
    title: "3. Visitor data collected by the tracker",
    body: (
      <>
        <p>When the Analycos script runs on a customer&apos;s site, it records:</p>
        <ul>
          <li>Page URL, path, page title and referrer, plus UTM campaign parameters if present.</li>
          <li>Screen size, browser, operating system and device type (derived from the User-Agent).</li>
          <li>
            IP address, used on our server to look up approximate location (country, region, city).
            The IP address is stored with the session record.
          </li>
          <li>
            A random visitor ID and session ID generated in the visitor&apos;s browser, and a
            periodic &quot;heartbeat&quot; so we can show who is online in real time.
          </li>
          <li>Custom events that the site owner chooses to send.</li>
        </ul>
        <p>
          We do not collect names, email addresses, form contents or keystrokes from visitors, and we
          do not sell visitor data or use it for advertising.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "4. Cookies and browser storage",
    body: (
      <ul>
        <li>
          <strong>Dashboard sign-in:</strong> <code>accessToken</code> and <code>refreshToken</code>{" "}
          cookies keep you signed in. They are essential and set only when you log in.
        </li>
        <li>
          <strong>Tracker:</strong> a visitor ID in <code>localStorage</code> (<code>_wh_vk</code>) and
          a session ID in <code>sessionStorage</code> (<code>_wh_sk</code>, 30-minute inactivity
          timeout). The no-script image fallback may use a first-party <code>_wide_vis</code> cookie,
          or a hash of IP and User-Agent, instead.
        </li>
        <li>We do not use third-party advertising or cross-site tracking cookies.</li>
      </ul>
    ),
  },
  {
    id: "use",
    title: "5. How we use data",
    body: (
      <ul>
        <li>To provide dashboards: visitors, pageviews, sources, devices, geography and real-time activity.</li>
        <li>To operate hit counters and public stats pages that the customer has enabled.</li>
        <li>To secure accounts, prevent abuse and troubleshoot problems.</li>
        <li>To contact you about your account or service changes.</li>
      </ul>
    ),
  },
  {
    id: "sharing",
    title: "6. Sharing and public pages",
    body: (
      <p>
        We do not sell personal data. Data is shared only with infrastructure providers that run the
        service, or when required by law. If a customer marks a website as <strong>public</strong>,
        its statistics pages (not account or settings pages) can be viewed by anyone with the link;
        customers can switch a site back to private at any time in Settings.
      </p>
    ),
  },
  {
    id: "retention",
    title: "7. Retention and deletion",
    body: (
      <p>
        Analytics data is kept while the website remains in your account. Deleting a website removes
        its associated analytics data; deleting your account removes your profile and sites. Backups
        may keep copies for a limited period before being overwritten. To request deletion or export
        of data, email us at the address below.
      </p>
    ),
  },
  {
    id: "security",
    title: "8. Security",
    body: (
      <p>
        Passwords are hashed, sign-in cookies are HttpOnly, and dashboard queries are restricted to
        the website owner&apos;s account. No system is perfectly secure, so please use a strong,
        unique password.
      </p>
    ),
  },
  {
    id: "rights",
    title: "9. Your rights",
    body: (
      <p>
        Depending on where you live, you may have rights to access, correct, export or delete your
        personal data and to object to certain processing. Visitors of a tracked site should contact
        the site owner first; we will assist the owner in responding. Site owners are responsible for
        giving their visitors any notice or consent required by local law.
      </p>
    ),
  },
  {
    id: "changes",
    title: "10. Changes and contact",
    body: (
      <p>
        We may update this policy and will change the date above when we do. Questions or requests:{" "}
        <a href="mailto:support@analycos.com">support@analycos.com</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="What Analycos collects, why, and the choices you have."
      updated="November 15, 2026"
      sections={sections}
    />
  );
}

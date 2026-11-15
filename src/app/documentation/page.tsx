import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Documentation — Analycos",
  description: "Install the Analycos tracking script and understand the dashboard reports.",
  alternates: { canonical: "/documentation" },
};

const snippet = `<script
  async
  src="https://YOUR-ANALYCOS-HOST/tracker.js"
  data-website-id="YOUR_TRACKING_ID"
></script>`;

const eventSnippet = `window.wideHistat.trackEvent("signup", { plan: "free" });`;

const sections: LegalSection[] = [
  {
    id: "getting-started",
    title: "1. Getting started",
    body: (
      <ul>
        <li>Create an account and sign in.</li>
        <li>Open <strong>Websites</strong> and add your site&apos;s name and domain.</li>
        <li>Open the site&apos;s tracking code window and copy the snippet shown there.</li>
        <li>Paste it into the <code>&lt;head&gt;</code> or just before <code>&lt;/body&gt;</code> of every page.</li>
      </ul>
    ),
  },
  {
    id: "snippet",
    title: "2. Tracking snippet",
    body: (
      <>
        <p>The snippet looks like this (use the exact code from your dashboard, which has your real host and ID):</p>
        <pre className="p-3 rounded-md bg-slate-900 text-slate-100 text-[12px] overflow-x-auto">
          {snippet}
        </pre>
        <p>
          Single-page apps are supported: route changes through the History API are tracked
          automatically. A <code>&lt;noscript&gt;</code> image fallback is also provided for visitors
          without JavaScript.
        </p>
      </>
    ),
  },
  {
    id: "events",
    title: "3. Custom events",
    body: (
      <>
        <p>After the script loads you can send your own events:</p>
        <pre className="p-3 rounded-md bg-slate-900 text-slate-100 text-[12px] overflow-x-auto">
          {eventSnippet}
        </pre>
        <p>Do not include personal data (names, emails, etc.) in event data.</p>
      </>
    ),
  },
  {
    id: "reports",
    title: "4. Reports",
    body: (
      <ul>
        <li><strong>Summary</strong> — headline visitors and pageviews for the selected period.</li>
        <li><strong>Real-time</strong> — who is on your site right now and where they are.</li>
        <li><strong>Traffic stats</strong> — hourly and daily traffic breakdowns.</li>
        <li><strong>Sources</strong> — referrers, search engines, social and campaigns (UTM).</li>
        <li><strong>Pages</strong> — top, landing and exit pages.</li>
        <li><strong>Devices</strong> and <strong>Geography</strong> — browsers, OS, device types, countries and cities.</li>
      </ul>
    ),
  },
  {
    id: "counters",
    title: "5. Hit counters and public stats",
    body: (
      <p>
        In the tracking code window you can pick a counter style to show a live visitor badge on your
        site. In <strong>Settings</strong> you can make a website public so its stats pages can be
        viewed without signing in; account and settings pages always stay private.
      </p>
    ),
  },
  {
    id: "troubleshooting",
    title: "6. Troubleshooting",
    body: (
      <ul>
        <li>No data? Check that the snippet is on the page and the tracking ID matches your site.</li>
        <li>Ad blockers and strict privacy browsers can block the script, so counts may be lower than real traffic.</li>
        <li>Real-time is based on heartbeats sent every 15 seconds, so it reflects roughly the last few minutes.</li>
        <li>Still stuck? Email <a href="mailto:support@analycos.com">support@analycos.com</a>.</li>
      </ul>
    ),
  },
];

export default function DocumentationPage() {
  return (
    <LegalPage
      title="Documentation"
      subtitle="Install the tracker and read your reports."
      updated="November 15, 2026"
      sections={sections}
    />
  );
}

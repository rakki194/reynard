import { Routes, Route } from "@solidjs/router";
import { EmailDashboard } from "./pages/EmailDashboard";
import { EmailComposer } from "./pages/EmailComposer";
import { EmailInbox } from "./pages/EmailInbox";
import { ImapInbox } from "./pages/ImapInbox";
import { EmailTemplates } from "./pages/EmailTemplates";
import { AgentEmailCenter } from "./pages/AgentEmailCenter";
import { Layout } from "./components/Layout";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" component={EmailDashboard} />
        <Route path="/compose" component={EmailComposer} />
        <Route path="/inbox" component={EmailInbox} />
        <Route path="/imap-inbox" component={ImapInbox} />
        <Route path="/templates" component={EmailTemplates} />
        <Route path="/agents" component={AgentEmailCenter} />
      </Routes>
    </Layout>
  );
}

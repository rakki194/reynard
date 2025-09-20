import { EmailComposer } from "reynard-email/components";
import { useNavigate } from "@solidjs/router";

export function EmailComposerPage() {
  const navigate = useNavigate();

  const handleSend = (message: any) => {
    console.log("Email sent:", message);
    navigate("/dashboard");
  };

  const handleSave = (message: any) => {
    console.log("Email saved as draft:", message);
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div class="email-composer-page">
      <div class="page-header">
        <h1>Compose Email</h1>
        <p>Create and send email messages</p>
      </div>
      
      <EmailComposer
        onSend={handleSend}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}


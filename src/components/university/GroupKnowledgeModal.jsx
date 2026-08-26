import { BrainCircuit } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Badge from "../common/Badge";
import ErrorBanner from "../common/ErrorBanner";
import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";
import * as universityAdminApi from "../../api/universityAdminApi";
import { useAsync } from "../../hooks/useAsync";

const SOURCE_LABELS = {
  human_verified: "Human verified",
  seed: "Profile",
  manual: "Manual",
  scraped: "Scraped",
  conversation: "Learned in chat",
};

export default function GroupKnowledgeModal({ slug, label, open, onClose }) {
  const { data, loading, error, refetch } = useAsync(
    (signal) => universityAdminApi.getKnowledgeGroupDetail(slug, signal),
    [slug, open],
    { enabled: open && !!slug }
  );

  const group = data?.group;
  const facts = data?.knowledge || [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`${label} · facts`}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {error && <ErrorBanner error={error} onDismiss={refetch} />}

        {loading ? (
          <Spinner label="Loading facts..." />
        ) : !error && group ? (
          <>
            <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-3 text-xs text-ink-500">
              {group.escalation_count} escalation{group.escalation_count === 1 ? "" : "s"} routed here
              {group.escalation_contact_name && (
                <>
                  {" "}
                  · contact: {group.escalation_contact_name}
                  {group.escalation_contact_email && ` (${group.escalation_contact_email})`}
                </>
              )}
            </div>

            {facts.length === 0 ? (
              <EmptyState
                icon={BrainCircuit}
                title="No facts in this group yet"
                description="Assign facts to this group from the Knowledge Base page."
              />
            ) : (
              <div className="space-y-3">
                {facts.map((fact) => (
                  <div
                    key={fact.id}
                    className="rounded-lg border border-ink-100 bg-white p-3"
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">
                        {SOURCE_LABELS[fact.source_type] || fact.source_type}
                      </Badge>
                      {fact.times_used > 0 && (
                        <span className="text-xs text-ink-400">used {fact.times_used}×</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-ink-900">{fact.topic}</p>
                    <p className="mt-1 text-sm text-ink-700">{fact.content}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </Modal>
  );
}

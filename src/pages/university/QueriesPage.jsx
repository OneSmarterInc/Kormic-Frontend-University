import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import clsx from "clsx";
import { MessagesSquare, CheckCircle2, Pencil } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Card, { CardBody } from "../../components/common/Card";
import Spinner from "../../components/common/Spinner";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";
import Badge, { queryStatusTone } from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { Field, Input, Textarea } from "../../components/common/Input";
import {
  listAllQueries,
  listActiveQueries,
  listArchivedQueries,
} from "../../api/universityApi";
import { answerQuery, editQueryAnswer } from "../../api/queriesApi";
import { useAction, useAsync } from "../../hooks/useAsync";

const TABS = [
  { key: "active", label: "Active", fetcher: listActiveQueries },
  { key: "all", label: "All", fetcher: listAllQueries },
  { key: "archive", label: "Archive", fetcher: listArchivedQueries },
];

export default function QueriesPage() {
  const { universityId } = useParams();
  const [tab, setTab] = useState("active");
  const [answering, setAnswering] = useState(null); // query object or null

  const activeTab = TABS.find((t) => t.key === tab);
  const { data, loading, error, refetch } = useAsync(
    () => activeTab.fetcher(universityId),
    [universityId, tab]
  );

  const queries = data?.queries || [];

  return (
    <div>
      <PageHeader
        title="Escalated queries"
        description="Questions an agent couldn't answer confidently, routed to an officer."
      />

      <div className="mb-4 inline-flex rounded-lg bg-ink-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t.key ? "bg-white text-brand-700 shadow-sm" : "text-ink-500 hover:text-ink-800"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Loading queries..." />
      ) : error ? (
        <ErrorBanner error={error} onDismiss={refetch} />
      ) : queries.length === 0 ? (
        <Card>
          <EmptyState
            icon={MessagesSquare}
            title="Nothing here"
            description="No queries match this view right now."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {queries.map((q) => (
            <QueryCard key={q.query_id} query={q} onRespond={() => setAnswering(q)} />
          ))}
        </div>
      )}

      <AnswerModal
        query={answering}
        onClose={() => setAnswering(null)}
        onSaved={() => {
          setAnswering(null);
          refetch();
        }}
      />
    </div>
  );
}

function QueryCard({ query, onRespond }) {
  const resolved = query.display_status === "answered";
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge tone={queryStatusTone(query.display_status)}>{query.display_status}</Badge>
            {query.priority && <Badge tone="neutral">{query.priority}</Badge>}
            <span className="text-xs text-ink-400">#{query.query_id}</span>
            {query.student_name && (
              <span className="text-xs text-ink-500">· {query.student_name}</span>
            )}
            {query.program && <span className="text-xs text-ink-500">· {query.program}</span>}
          </div>
          <p className="text-sm font-medium text-ink-900">{query.question}</p>
          {query.urgency_reason && (
            <p className="mt-1 text-xs text-ink-500">{query.urgency_reason}</p>
          )}
          {/* {query.escalation_chain?.length > 0 && (
            <ol className="mt-2 space-y-1 border-l-2 border-ink-100 pl-3">
              {query.escalation_chain.map((step, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-ink-500">
                  <span
                    className={clsx(
                      "h-1.5 w-1.5 rounded-full",
                      step.resolved ? "bg-emerald-500" : "bg-ink-300"
                    )}
                  />
                  {step.step}
                </li>
              ))}
            </ol>
          )} */}
          {resolved && (
            <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <span className="font-medium">{query.answered_by}: </span>
              {query.answer}
            </div>
          )}
        </div>

        <Button
          variant={resolved ? "secondary" : "primary"}
          size="sm"
          icon={resolved ? Pencil : CheckCircle2}
          onClick={onRespond}
        >
          {resolved ? "Edit answer" : "Answer"}
        </Button>
      </div>
    </Card>
  );
}

function AnswerModal({ query, onClose, onSaved }) {
  const [answer, setAnswer] = useState("");
  const [answeredBy, setAnsweredBy] = useState("");
  const resolved = query?.display_status === "answered";

  useEffect(() => {
    if (query) {
      setAnswer(query.answer || "");
      setAnsweredBy(query.answered_by || "");
    }
  }, [query]);

  const { execute, loading, error } = useAction(() =>
    resolved
      ? editQueryAnswer(query.query_id, answer, answeredBy)
      : answerQuery(query.query_id, answer, answeredBy)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || !answeredBy.trim()) {
      toast.error("Answer and your name are both required");
      return;
    }
    try {
      const res = await execute();
      toast.success(res.message || "Saved");
      onSaved();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal
      open={!!query}
      onClose={onClose}
      title={resolved ? `Edit answer · #${query?.query_id}` : `Answer · #${query?.query_id}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Save
          </Button>
        </>
      }
    >
      {query && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700">{query.question}</div>
          {error && <ErrorBanner error={error} />}
          <Field label="Answer" required>
            <Textarea
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write a durable, verified answer..."
            />
          </Field>
          <Field label="Answered by" required hint="Saved into the verified knowledge base">
            <Input
              value={answeredBy}
              onChange={(e) => setAnsweredBy(e.target.value)}
              placeholder="Dr. Sarah Chen"
            />
          </Field>
        </form>
      )}
    </Modal>
  );
}

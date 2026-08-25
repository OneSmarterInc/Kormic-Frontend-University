import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, MessagesSquare, UserRound } from "lucide-react";

import PageHeader from "../../components/layout/PageHeader";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Spinner from "../../components/common/Spinner";
import ErrorBanner from "../../components/common/ErrorBanner";
import ChatThread from "../../components/common/ChatThread";
import ProfileSummary from "../../components/university/ProfileSummary";
import {
  listUniversityProfiles,
  chatWithPresenter,
  getPresenterChatHistory,
} from "../../api/universityApi";
import { getAgentName } from "../../api/universityAdminApi";
import { useAction, useAsync } from "../../hooks/useAsync";

export default function ProfileDetailPage() {
  const { universityId, studentId } = useParams();

  const { data, loading, error, refetch } = useAsync(
    () => listUniversityProfiles(universityId),
    [universityId]
  );

  const { data: agentInfo } = useAsync(getAgentName, [universityId]);

  const profile =
    data?.profiles?.find((p) => p.profile_id === studentId) ?? null;

  return (
    <div className="space-y-6">
      <Link
        to={`/university/${universityId}/profiles`}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 hover:shadow-md"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profiles
      </Link>

      {/* <PageHeader
        title={studentId}
        description="Officer view - profile detail and Q&A."
      /> */}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <Card>
          {/* <CardHeader icon={UserRound} title="Profile" /> */}

          <CardBody>
            {loading ? (
              <Spinner label="Loading profile..." />
            ) : error ? (
              <ErrorBanner error={error} onDismiss={refetch} />
            ) : (
              <ProfileSummary profile={profile} />
            )}
          </CardBody>
        </Card>

        <PresenterChatCard
          universityId={universityId}
          studentId={studentId}
          agentName={agentInfo?.agent_name}
        />
      </div>
    </div>
  );
}

function PresenterChatCard({ universityId, studentId, agentName }) {
  const [messages, setMessages] = useState([]);

  const { data: history, loading: historyLoading } = useAsync(
    () => getPresenterChatHistory(universityId, studentId),
    [universityId, studentId]
  );

  useEffect(() => {
    if (!history) return;
    setMessages(
      (history.messages || []).map((m) => ({
        role: m.sender === "assistant" ? "assistant" : "user",
        content: m.content,
      }))
    );
  }, [history]);

  const { execute, loading } = useAction((question, history) =>
    chatWithPresenter(universityId, studentId, question, history)
  );

  const handleSend = async (question) => {
    const history = messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    setMessages((m) => [...m, { role: "user", content: question }]);

    try {
      const res = await execute(question, history);

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer,
        },
      ]);
    } catch (err) {
      toast.error(err.message);

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Presenter failed: ${err.message}`,
          tone: "warning",
        },
      ]);
    }
  };

  return (
    <Card className="overflow-hidden transition-all h-full duration-300">
      <CardHeader
        icon={MessagesSquare}
        title={agentName ? `Ask ${agentName} about this student` : "Ask your agent about this student"}
        subtitle="Ask honest questions about this interested candidate and get a quick assessment of their fit for your program."
      />

      <CardBody className="p-0">
        {historyLoading && messages.length === 0 ? (
          <div className="flex h-[380px] items-center justify-center">
            <Spinner label="Loading conversation..." />
          </div>
        ) : (
          <ChatThread
            compact
            messages={messages}
            onSend={handleSend}
            loading={loading}
            placeholder="e.g. Is this student a strong fit? What are the biggest gaps?"
            emptyTitle="Ask about this applicant"
            emptyDescription='Try: "Is this student a strong fit for our MS CS program?"'
          />
        )}
      </CardBody>
    </Card>
  );
}
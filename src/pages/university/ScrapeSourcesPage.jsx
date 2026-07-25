import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Globe, Plus, RotateCw, Trash2, XCircle } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import * as universityAdminApi from "../../api/universityAdminApi";
import { useAction, useAsync } from "../../hooks/useAsync";

export default function ScrapeSourcesPage() {
  const [urls, setUrls] = useState([]);
  const [draft, setDraft] = useState("");
  const [results, setResults] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);

  const { data, loading, error, refetch } = useAsync(
    universityAdminApi.getScrapeUrls,
    []
  );

  useEffect(() => {
    if (data) setUrls(data.scrape_urls || []);
  }, [data]);

  const {
    execute: persist,
    loading: saving,
    error: saveError,
  } = useAction((next) => universityAdminApi.setScrapeUrls(next));

  const {
    execute: runScrape,
    loading: scraping,
    error: scrapeError,
  } = useAction(universityAdminApi.scrapeNow);

  const addUrl = async () => {
    const value = draft.trim();

    if (!value) return;

    const next = [...urls, value];

    try {
      const res = await persist(next);
      setUrls(res.scrape_urls);
      setDraft("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeUrl = async (url) => {
    const next = urls.filter((u) => u !== url);

    try {
      const res = await persist(next);
      setUrls(res.scrape_urls);

      if (selectedUrl === url) {
        setSelectedUrl(null);
      }

      toast.success("URL removed");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleScrapeNow = async () => {
    try {
      const res = await runScrape();
      setResults(res);
      toast.success(`${res.total_facts_stored} facts stored`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Sources"
        description="Save your program's official pages — scraping pulls durable facts straight into the knowledge base."
      />

      <Card>
        <CardHeader
          icon={Globe}
          title="Saved URLs"
          action={
            <Button
              icon={RotateCw}
              loading={scraping}
              onClick={handleScrapeNow}
              disabled={urls.length === 0}
            >
              Scrape now
            </Button>
          }
        />

        <CardBody className="space-y-4">
          {scrapeError && <ErrorBanner error={scrapeError} />}
          {saveError && <ErrorBanner error={saveError} />}

          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                addUrl();
              }}
              placeholder="https://university.edu/admissions/international"
              type="url"
            />

            <Button
              icon={Plus}
              onClick={addUrl}
              loading={saving}
              disabled={!draft.trim()}
            >
              Add
            </Button>
          </div>

          {loading ? (
            <Spinner label="Loading saved URLs..." />
          ) : error ? (
            <ErrorBanner error={error} onDismiss={refetch} />
          ) : urls.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No URLs saved yet"
              description="Add your admissions or program pages above, then hit Scrape now."
            />
          ) : (
            <ul className="space-y-2">
              {urls.map((url) => {
                const isSelected = selectedUrl === url;

                return (
                  <li
                    key={url}
                    onClick={() => setSelectedUrl(url)}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-all duration-150 hover:border-blue-500 hover:bg-blue-50/40 hover:shadow-sm ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-sm"
                        : "border-ink-100 bg-white"
                    }`}
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setSelectedUrl(url)}
                      className="truncate text-ink-700 hover:text-brand-600"
                    >
                      {url}
                    </a>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUrl(url);
                      }}
                      className="shrink-0 rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      {results && (
        <Card>
          <CardHeader
            title="Last scrape result"
            subtitle={`${results.total_facts_stored} fact(s) stored across ${results.results.length} URL(s)`}
          />

          <CardBody className="space-y-2">
            {results.results.map((r) => (
              <div
                key={r.url}
                className="flex items-start justify-between gap-3 rounded-lg border border-ink-100 px-3 py-2 transition-all duration-150 hover:border-blue-500 hover:bg-blue-50/40 hover:shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-700">{r.url}</p>
                  {r.error && (
                    <p className="mt-0.5 text-xs text-red-600">{r.error}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone="neutral">{r.facts_stored} facts</Badge>

                  {r.status === "ok" ? (
                    <Badge tone="success">
                      <CheckCircle2 className="h-3 w-3" /> ok
                    </Badge>
                  ) : (
                    <Badge tone="danger">
                      <XCircle className="h-3 w-3" /> failed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
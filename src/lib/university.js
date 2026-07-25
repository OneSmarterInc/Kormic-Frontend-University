
export const SETUP_STEPS = [
  {
    key: "has_description",
    label: "Add a program description",
    hint: "Tell Aria what this program is and who it's for.",
    to: "settings/profile",
  },
  {
    key: "has_contacts",
    label: "Add contact details",
    hint: "Admissions email, phone, and office address.",
    to: "settings/profile",
  },
  {
    key: "has_eligibility_criteria",
    label: "Add eligibility criteria",
    hint: "GPA minimums, test scores, prerequisites.",
    to: "settings/profile",
  },
  {
    key: "has_scrape_urls",
    label: "Add official website URLs",
    hint: "Let the agent learn from your admissions pages.",
    to: "settings/sources",
  },
  {
    key: "has_knowledge_facts",
    label: "Add at least one knowledge fact",
    hint: "Deadlines, funding, or anything scraping might miss.",
    to: "settings/knowledge-base",
  },
];

export function setupPercent(status) {
  if (!status) return 0;
  const done = SETUP_STEPS.filter((step) => status[step.key]).length;
  return Math.round((done / SETUP_STEPS.length) * 100);
}

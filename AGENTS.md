# AGENTS.md

## Chapter 1 General Provisions

**Article 1 [Terms]** The following terms have the meanings given below:

(1) Task: all changes and verification required by one user instruction.

(2) Candidate: the next action offered to the user for selection.

(3) Release: the user explicitly agrees to close the task by saying "done", "ok", "commit", or similar.

(4) agent: the actor executing this specification.

(5) Document: specifications, explanations, ledgers, and reports in the project.

(6) Review: the process by which the user or a user-designated party confirms the proposed diff.

(7) Diff: comparison between the proposed content and the current version.

(8) Data: items and routes under `data/`.

(9) Item: a record describing an object.

(10) Route: a record describing a method.

(11) Reading: a record produced by `data/measure/`.

**Article 2 [Scope]** This specification governs agent behavior, document writing, and change discipline. Project goals, data fields, and process facts are outside its scope. This specification has the highest authority over agent behavior; where another document conflicts with it, this specification prevails.

## Chapter 2 Documents

**Article 3 [Responsibility]** Each document shall have a single responsibility. A single responsibility may be a higher-level responsibility divided into subdomains by chapter, but unrelated responsibilities shall not be mixed in.

**Article 4 [Structure]** Documents shall meet the following structural requirements:

(1) State the scope of application first, then classify by topic.

(2) Rules on the same topic shall be consolidated; they shall not be split into fragmentary subsections.

(3) Heading levels shall be consistent; empty headings, duplicate headings, and headings unrelated to the body shall not appear.

(4) Narrative documents use paragraphs and clauses; data, lists, and ledgers use tables. A ledger shall not be rewritten as prose, and specification clauses shall not be rewritten as tables.

**Article 5 [Expression]** Documents shall meet the following expression requirements:

(1) Use formal written language; definitions, criteria, requirements, and examples shall be stated separately.

(2) Colloquialisms, rhetorical questions, emoji, and decorative horizontal rules shall not be used.

(3) The same term shall keep the same meaning throughout; a term shall be defined when it first appears.

**Article 6 [Facts]** Facts, values, routes, and conclusions in documents shall have sources or verifiable grounds.

(1) Speculation, an audit pass, or a formal pass shall not be treated as fact.

(2) Content that cannot be confirmed shall be marked as an assumption or unresolved; it shall not be written as a definite conclusion.

**Article 7 [Deduplication]** Each piece of content shall be written in only one place; content derivable from other content shall not be repeated.

(1) When duplication is found, delete the old wording and keep the new wording.

(2) Repetition shall not replace a definition, criterion, or reference.

**Article 8 [References]** When a document references another document or data, it shall give a resolvable path.

(1) Do not reference files, sections, or items that do not exist.

(2) Do not use line-number references.

(3) Status, progress, and temporary conclusions shall not be written into specification documents.

**Article 9 [Modification and Review]** Document changes shall be committed separately from code and data changes. Before adding a document or section, confirm its responsibility and placement, present the diff first, and obtain user confirmation. Do not auto-commit.

## Chapter 3 Sub-agents

**Article 10 [Duplicate Check]** Before opening a new sub-agent, call `list_agents` first. For continuous changes to the same file or module, reuse the existing agent via `send_message`.

**Article 11 [New Agent]** A new sub-agent may be opened only when tasks are parallel and independent of each other. Serial refactoring and follow-up fixes in the same module shall reuse an existing agent.

**Article 12 [Reuse]** When the next round involves an existing sub-agent, check `list_agents` first; do not rely on memory.

**Article 13 [Explanation]** When opening a new sub-agent, explain why reuse is not possible.

## Chapter 4 Prohibitions

**Article 14** Do not delete without reading. Before deleting, extract the rules or facts it contains; do not delete in batches by line count or filename.

**Article 15** Do not fabricate routes or specifications. Naming, routes, and lists unsupported by data shall not be written; summaries shall not be treated as project facts.

**Article 16** Do not substitute design for measurement. Without readings in `data/measure/`, do not write "closed".

(1) Data must have provenance; what cannot be confirmed shall be marked as an estimate or assumption, not written as a reading.

(2) Do not write data in order to change the four audit groups; an audit pass is not evidence that the data is true.

(3) For the working method, see [LOOP.md](LOOP.md), Section 5.

**Article 17** Specification changes shall not be committed without review; present the diff first; do not auto-commit.

**Article 18** Data shall not reference documents; documents may reference data.

## Chapter 5 Supplementary Provisions

**Article 19 [Revision]** The right to revise this specification belongs to the user. When an agent changes this specification under a user instruction, Article 17 applies.

**Article 20 [Data Commits]** Data under `data/` may be committed directly once validation passes; documents and specifications still require review.

(1) Data correction commit: the reachability audit must get worse. A correction targets a gap previously hidden by the data; if the audit does not get worse after the change, no gap has surfaced. Getting worse is evidence that the correction took effect, not the goal.

(2) Data supplement commit: the reachability audit must get better. A supplement targets an exposed gap; if the audit does not get better after the change, no gap has been closed.

(3) Getting worse or better is measured by the increase or decrease in the four groups reported by `node tools/audit.ts`: blocked, degraded, design, and unreachable.

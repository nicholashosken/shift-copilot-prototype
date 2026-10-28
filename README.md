# Shift Copilot — Proactive Work Continuation

An interactive product prototype for a PM/CPO case presentation. It shows one lightweight addition to an existing document-grounded Copilot: work from a previously successful, user-approved recurring task is prepared before the user returns.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Demo flow

1. Start on the regular Copilot landing area, where the generic input and common use cases represent the core product without starting a mock conversation.
2. Open the actionable **New · Prepared work** card below it. The card explains that Shift Copilot recognized Mariana’s usual Monday reporting pattern.
3. Review the preparation checklist, draft, and fictional source excerpts.
4. Use the draft-scoped chat to ask a question without leaving the review context.
5. Supply or mark the inventory variance unknown, then confirm or mark the shipment explanation unknown.
6. Approve the draft, review the preset delivery options from last week, and simulate **Complete and send** or **Download report**.
7. Confirm whether Shift Copilot should prepare the same contextual task next Monday.
8. Use **Why am I seeing this?** to inspect or stop the mock recurrence.

## Assumptions

- Mariana Costa, her role, the task, documents, excerpts, values, and timeline are fictional product-design assumptions.
- Cerrado Alimentos is used only as the scenario account name; no real account data or company documents appear in the UI.
- No authentication, network request, external API, actual scheduling, or production integration is used.
- All interactions update local React state only.
- Retention baselines and targets belong to the case narrative, not the end-user UI.

## One-page design note

### 1. Inside Copilot, not a separate workflow workspace

The intervention stays in the existing conversation shell so returning users do not need to learn a second product. A standalone task dashboard, new navigation system, and workflow builder were rejected because they would make the proposed feature look like a product redesign.

### 2. A draft before a reminder

The entry point shows useful work already completed: a weekly report grounded in an approved source scope with two explicit gaps. A digest or suggested prompt was rejected because it would test notification engagement rather than saved effort.

### 3. Human approval, not automatic publishing

The prepared draft shows sources, unresolved inputs, and a disabled approval action until both gaps are addressed or marked unknown. Silent completion was rejected because source reliability and human judgment are central trust constraints in the case.

## Implementation

- Existing React + Vite + TypeScript project, refactored in place
- Mock data isolated in `src/mockData.ts`
- One application shell with Home, draft review, and post-approval next-step states
- Responsive layout and keyboard-accessible native controls
- No backend or external dependencies beyond the local build toolchain

This project remains local until the owner explicitly approves publication.

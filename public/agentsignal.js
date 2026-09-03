(() => {
  const root = window;
  const issueTypes = [
    'missing_information',
    'unclear_information',
    'incomplete_information',
    'outdated_information',
    'technical_problem',
  ];
  const impacts = ['blocked', 'reduced_confidence', 'extra_effort'];
  const schema = {
    type: 'object',
    additionalProperties: false,
    required: [
      'issueType',
      'generalizedNeed',
      'pagePath',
      'observation',
      'impact',
    ],
    properties: {
      issueType: { type: 'string', enum: issueTypes },
      generalizedNeed: { type: 'string', maxLength: 140 },
      pagePath: { type: 'string', pattern: '^/[^?#]*$' },
      observation: { type: 'string', maxLength: 240 },
      impact: { type: 'string', enum: impacts },
    },
  };
  const validate = (value) => {
    if (
      !value ||
      typeof value !== 'object' ||
      Object.keys(value).length !== 5 ||
      Object.keys(value).some((key) => !schema.required.includes(key))
    )
      throw new Error('Only the documented report fields are allowed.');
    const report = {
      ...value,
      generalizedNeed: String(value.generalizedNeed || '').trim(),
      observation: String(value.observation || '').trim(),
      pagePath: String(value.pagePath || ''),
    };
    if (
      !issueTypes.includes(report.issueType) ||
      !impacts.includes(report.impact) ||
      !report.generalizedNeed ||
      report.generalizedNeed.length > 140 ||
      !report.observation ||
      report.observation.length > 240 ||
      !/^\/[^?#]*$/.test(report.pagePath)
    )
      throw new Error(
        'The report does not meet AgentSignal’s narrow privacy contract.',
      );
    return report;
  };
  const review = (report) =>
    new Promise((resolve) => {
      const overlay = document.createElement('div'),
        card = document.createElement('section'),
        label = document.createElement('b'),
        heading = document.createElement('h2'),
        message = document.createElement('p'),
        form = document.createElement('form'),
        error = document.createElement('p'),
        cancel = document.createElement('button'),
        approve = document.createElement('button');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.style.cssText =
        'position:fixed;inset:0;z-index:2147483647;background:#10242699;display:grid;place-items:center;padding:20px;font:14px Arial;color:#172225';
      card.style.cssText =
        'width:min(100%,520px);max-height:calc(100vh - 40px);overflow:auto;background:#fffefa;padding:28px;box-shadow:0 18px 50px #0004';
      label.style.cssText = 'color:#13696b;font-size:11px;letter-spacing:.1em';
      label.textContent = 'REVIEW BEFORE SENDING';
      heading.style.cssText = 'font:32px Georgia;margin:12px 0';
      heading.textContent = 'Make this report yours.';
      message.textContent =
        'You can correct the agent’s draft before it goes to the website owner. Keep it about the website, never you or your conversation.';
      form.style.cssText = 'display:grid;gap:14px;margin-top:22px';
      error.style.cssText =
        'display:none;margin:0;color:#9f3022;line-height:1.4';
      const addField = (labelText, control, hint) => {
        const field = document.createElement('label');
        const name = document.createElement('span');
        field.style.cssText =
          'display:grid;gap:6px;color:#4d5b5d;font-size:12px;font-weight:bold';
        name.textContent = labelText;
        control.style.cssText =
          'width:100%;border:1px solid #d7dfda;border-radius:4px;padding:9px;background:#fff;color:#172225;font:14px/1.4 Arial';
        field.append(name, control);
        if (hint) {
          hint.style.cssText =
            'color:#617075;font-size:11px;font-weight:normal;text-align:right';
          field.append(hint);
        }
        form.append(field);
      };
      const issue = document.createElement('select');
      issueTypes.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value.replaceAll('_', ' ');
        issue.append(option);
      });
      issue.value = report.issueType;
      const need = document.createElement('input');
      need.value = report.generalizedNeed;
      need.maxLength = 140;
      need.required = true;
      const needCount = document.createElement('small');
      const observation = document.createElement('textarea');
      observation.value = report.observation;
      observation.maxLength = 240;
      observation.required = true;
      observation.style.minHeight = '92px';
      observation.style.resize = 'vertical';
      const observationCount = document.createElement('small');
      const updateCounts = () => {
        needCount.textContent = `${need.value.length}/140`;
        observationCount.textContent = `${observation.value.length}/240`;
      };
      need.oninput = updateCounts;
      observation.oninput = updateCounts;
      updateCounts();
      const pagePath = document.createElement('input');
      pagePath.value = report.pagePath;
      pagePath.required = true;
      pagePath.pattern = '/[^?#]*';
      const impact = document.createElement('select');
      impacts.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value.replaceAll('_', ' ');
        impact.append(option);
      });
      impact.value = report.impact;
      addField('Issue', issue);
      addField('What the site needs', need, needCount);
      addField('Page path', pagePath);
      addField('What happened', observation, observationCount);
      addField('Impact', impact);
      cancel.textContent = 'Cancel';
      approve.textContent = 'Approve & send';
      approve.style.cssText =
        'background:#13696b;color:white;border:0;padding:10px 14px';
      const actions = document.createElement('footer');
      actions.style.cssText = 'display:flex;justify-content:end;gap:9px';
      actions.append(cancel, approve);
      form.append(error, actions);
      card.append(label, heading, message, form);
      overlay.append(card);
      const done = (result) => {
        overlay.remove();
        resolve(result);
      };
      cancel.onclick = () => done({ state: 'cancelled' });
      form.onsubmit = async (event) => {
        event.preventDefault();
        error.style.display = 'none';
        let edited;
        try {
          edited = validate({
            issueType: issue.value,
            generalizedNeed: need.value,
            pagePath: pagePath.value,
            observation: observation.value,
            impact: impact.value,
          });
        } catch (validationError) {
          error.textContent = validationError.message;
          error.style.display = 'block';
          return;
        }
        approve.disabled = true;
        cancel.disabled = true;
        const headers = { 'content-type': 'application/json' };
        if (root.AgentSignal.siteId)
          headers['x-agentsignal-site'] = root.AgentSignal.siteId;
        try {
          const response = await fetch(
            `${root.AgentSignal.apiOrigin}/api/reports`,
            { method: 'POST', headers, body: JSON.stringify(edited) },
          );
          if (!response.ok) throw new Error('Report could not be saved.');
          done({ state: 'submitted', report: await response.json() });
        } catch {
          approve.disabled = false;
          cancel.disabled = false;
          error.textContent = 'Report could not be saved. Please try again.';
          error.style.display = 'block';
        }
      };
      document.body.append(overlay);
      cancel.focus();
    });
  root.AgentSignal = {
    init(options = {}) {
      if (
        root.__agentSignalRegistered ||
        typeof document.modelContext?.registerTool !== 'function'
      )
        return false;
      root.__agentSignalRegistered = true;
      root.AgentSignal.apiOrigin = (
        options.apiOrigin || root.location.origin
      ).replace(/\/$/, '');
      root.AgentSignal.siteId = options.siteId || '';
      document.modelContext.registerTool({
        name: 'agentsignal_report_site_issue',
        description:
          'Prepare a generalized same-site website issue only. Never include names, contact details, account information, original prompts, conversation text, or cross-site context. The visitor can edit the exact report before approving any submission.',
        inputSchema: schema,
        execute: async (input) => review(validate(input)),
      });
      return true;
    },
  };
  root.AgentSignal.init();
})();

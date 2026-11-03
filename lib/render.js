/**
 * Text renderers for the four tools. Each renderer turns the JSON value
 * returned by a tool's execute() into one plain-text block the agent reads
 * and then acts on (agent backend: the agent performs the actual writing).
 */
function asString(value, fallback) {
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}
function asArray(value) {
    return Array.isArray(value) ? value : [];
}
/* ---------------- paper_plan ---------------- */
export function renderPlan(value) {
    const data = value;
    const workflow = data['workflow'];
    const lines = [];
    lines.push('=== 论文规划工作流 ===');
    const topic = asString(data['topic'], '');
    if (topic !== '')
        lines.push(`主题：${topic}`);
    lines.push('');
    for (const phase of workflow.phases) {
        lines.push(`【${phase.name_zh}】${phase.goal}`);
        phase.steps.forEach((step, i) => lines.push(`  ${i + 1}. ${step}`));
        lines.push(`  → 产物：${phase.output}`);
        lines.push('');
    }
    lines.push('—— 全局原则 ——');
    workflow.principles.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
    lines.push('');
    lines.push('—— 高频坏写法（写作时禁用）——');
    workflow.antipatterns.forEach(a => lines.push(`· 「${a.pattern}」→ ${a.replace}（${a.why}）`));
    lines.push('');
    lines.push('【执行要求】按上述阶段推进：先明确核心贡献一句话，再产出大纲（章节 + 每节要点 + 关键图表占位），然后征询用户意见。不要一次写完全文。');
    return lines.join('\n');
}
/* ---------------- paper_write ---------------- */
export function renderSection(value) {
    const data = value;
    const guide = data['guide'];
    const lines = [];
    lines.push(`=== ${guide.name_zh} · 分节写作指南 ===`);
    lines.push(`目标：${guide.goal}`);
    lines.push('');
    lines.push('—— 写作动作（按顺序）——');
    guide.moves.forEach(m => lines.push(`${m.n}. ${m.move}`));
    lines.push('');
    lines.push('—— 常见错误 ——');
    guide.pitfalls.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
    lines.push('');
    lines.push('—— 可用骨架 ——');
    lines.push(guide.template);
    const task = asString(data['task'], '');
    if (task !== '') {
        lines.push('');
        lines.push(`本节要传达的内容：${task}`);
    }
    lines.push('');
    lines.push('【执行要求】严格按照上面的动作序列撰写这一节；完成后用 paper_check 的对应维度自检一遍，再交给用户。');
    return lines.join('\n');
}
/* ---------------- paper_polish ---------------- */
export function renderPolish(value) {
    const data = value;
    const polish = data['polish'];
    const language = asString(data['language'], 'zh');
    const intensity = asString(data['intensity'], 'normal');
    const lines = [];
    lines.push('=== 学术润色规程 ===');
    if (intensity !== 'light') {
        lines.push('');
        lines.push('—— 编辑原则（逐条对照修改）——');
        polish.principles.forEach(p => lines.push(`· ${p.title_zh}：${p.rule}`));
        lines.push('');
        lines.push('—— 压缩与具体化手法 ——');
        polish.compression.forEach((c, i) => lines.push(`${i + 1}. ${c}`));
    }
    lines.push('');
    lines.push('—— 必须清除的 AI 腔 ——');
    if (language === 'en') {
        polish.aiClichés.en.forEach(c => lines.push(`· ${c}`));
        if (polish.aiClichés.zh.length > 0) {
            lines.push('（中文语境同禁：）');
            polish.aiClichés.zh.forEach(c => lines.push(`· ${c}`));
        }
    }
    else {
        polish.aiClichés.zh.forEach(c => lines.push(`· ${c}`));
        if (polish.aiClichés.en.length > 0) {
            lines.push('（英文稿同禁：）');
            polish.aiClichés.en.forEach(c => lines.push(`· ${c}`));
        }
    }
    lines.push('');
    lines.push('—— 润色后自检 ——');
    polish.checklist.forEach((c, i) => lines.push(`${i + 1}. ${c}`));
    lines.push('');
    lines.push('【执行要求】在不改变原意、术语、数据与引用的前提下，应用以上规则改写用户提供的文本；输出：①润色后的全文 ②修改要点说明（逐条列出改了哪类问题）。用户要求的强度越高，改动越彻底。');
    return lines.join('\n');
}
/* ---------------- paper_check ---------------- */
export function renderChecks(value) {
    const data = value;
    const checks = data['checks'];
    const chosen = asArray(data['dimensions']);
    const lines = [];
    lines.push('=== 论文自检清单 ===');
    lines.push('');
    for (const dim of chosen) {
        lines.push(`【${dim.name_zh}】`);
        dim.questions.forEach((q, i) => lines.push(`  ${i + 1}. ${q}`));
        lines.push('');
    }
    lines.push('【执行要求】对照清单逐项检查草稿（草稿在用户提供的文本、文件或本对话上下文中），按维度输出：每项给出 通过/问题 + 具体位置（引用原句）+ 修改建议。最后给一段总体评价与最需要先改的 3 处。');
    return lines.join('\n');
}

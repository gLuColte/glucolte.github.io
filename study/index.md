---
title: study
permalink: /study/
---

# /study {#study}

A home for study resources, with a focus on **coding interview prep**.  
Think of this page as your **mental compass** — quick reminders on *how to think* before diving into the categories.

---

## Infrastructure & Cloud {#infrastructure-cloud}

The following are infrastructure and cloud services study pages:

<div class="study-tiles">
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/infrastructure' %}
    <a href="{{ p.url | relative_url }}" class="study-tile system-design">
      <div class="study-tile-title">
        <span class="study-tile-icon">🏗️</span>
        {{ p.title | default: p.url }}
      </div>
    </a>
  {% endif %}
{% endfor %}
</div>

{% capture cantrill_tm_script %}
{% raw %}
// ==UserScript==
// @name         Cantrill Sidebar Filter (Floating UI)
// @namespace    cantrill-sidebar-filter
// @version      1.1.1
// @description  Hide sidebar items whose lecture title contains any configured ignore strings. Includes a floating bottom-left UI to edit ignore strings.
// @match        https://learn.cantrill.io/courses/*/lectures/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(() => {
  "use strict";

  const KEY_ENABLED = "csf_enabled";
  const KEY_IGNORE_LIST = "csf_ignore_list";
  const DEFAULT_IGNORE = ["ASSOCIATESHARED", "SHAREDALL"];

  if (!/\/courses\/[^/]+\/lectures\/[^/?#]+/.test(location.pathname)) return;

  const getEnabled = () => GM_getValue(KEY_ENABLED, true);
  const setEnabled = v => GM_setValue(KEY_ENABLED, !!v);

  const normalizeTokens = tokens =>
    (tokens || []).map(s => String(s).trim()).filter(Boolean);

  const parseTokens = text =>
    normalizeTokens(String(text || "").split(/[\n,]/g));

  const getIgnoreList = () => {
    const raw = GM_getValue(KEY_IGNORE_LIST, null);
    if (raw == null) return DEFAULT_IGNORE.slice();
    if (Array.isArray(raw)) return normalizeTokens(raw);
    return parseTokens(raw);
  };

  const setIgnoreList = tokens =>
    GM_setValue(KEY_IGNORE_LIST, normalizeTokens(tokens));

  function shouldHideTitle(title, ignoreTokens) {
    if (!title) return false;
    const t = title.toLowerCase();
    return ignoreTokens.some(tok => t.includes(tok.toLowerCase()));
  }

  function applyFilter() {
    const enabled = getEnabled();
    const ignoreTokens = getIgnoreList();

    document.querySelectorAll("li.section-item").forEach(li => {
      const title = li.querySelector(".lecture-name")?.textContent ?? "";

      if (!enabled) {
        li.style.removeProperty("display");
        li.removeAttribute("data-csf-hidden");
        return;
      }

      if (shouldHideTitle(title, ignoreTokens)) {
        li.style.display = "none";
        li.setAttribute("data-csf-hidden", "1");
      } else if (li.getAttribute("data-csf-hidden")) {
        li.style.removeProperty("display");
        li.removeAttribute("data-csf-hidden");
      }
    });

    updateButtonState();
  }

  // ---------------- UI ----------------
  const UI_ID = "csf-ui-root";

  function injectStyles() {
    if (document.getElementById("csf-style")) return;

    const style = document.createElement("style");
    style.id = "csf-style";
    style.textContent = `
      #${UI_ID} {
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 999999;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }

      .csf-fab {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.95);
        border: 1px solid rgba(0,0,0,0.08);
        box-shadow: 0 12px 32px rgba(0,0,0,0.22);
        cursor: pointer;
        user-select: none;
      }

      .csf-dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #22c55e;
        box-shadow: 0 0 0 4px rgba(34,197,94,0.18);
      }
      .csf-dot.off {
        background: #ef4444;
        box-shadow: 0 0 0 4px rgba(239,68,68,0.18);
      }

      .csf-label {
        font-size: 13px;
        font-weight: 600;
      }

      .csf-panel {
        margin-bottom: 10px;
        width: 320px;
        border-radius: 16px;
        background: rgba(255,255,255,0.97);
        border: 1px solid rgba(0,0,0,0.08);
        box-shadow: 0 18px 50px rgba(0,0,0,0.25);
        animation: csf-pop 140ms ease-out;
        transform-origin: bottom left;
      }

      @keyframes csf-pop {
        from { transform: scale(0.97); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      .csf-panel-header {
        padding: 12px;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid rgba(0,0,0,0.06);
        font-weight: 700;
      }

      .csf-panel-body {
        padding: 12px;
      }

      .csf-textarea {
        width: 100%;
        height: 90px;
        border-radius: 12px;
        padding: 10px;
        border: 1px solid rgba(0,0,0,0.12);
        font-size: 12.5px;
      }

      .csf-actions {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }

      .csf-btn {
        flex: 1;
        padding: 9px;
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,0.1);
        cursor: pointer;
        font-weight: 600;
      }

      .csf-btn.primary {
        background: rgba(59,130,246,0.12);
      }
    `;
    document.head.appendChild(style);
  }

  function createUI() {
    if (document.getElementById(UI_ID)) return;

    injectStyles();

    const root = document.createElement("div");
    root.id = UI_ID;

    const panel = document.createElement("div");
    panel.className = "csf-panel";
    panel.style.display = "none";
    panel.innerHTML = `
      <div class="csf-panel-header">
        Sidebar Filter
        <span style="cursor:pointer" class="csf-close">×</span>
      </div>
      <div class="csf-panel-body">
        <textarea class="csf-textarea"></textarea>
        <div class="csf-actions">
          <button class="csf-btn primary csf-save">Save</button>
          <button class="csf-btn csf-reset">Reset</button>
        </div>
      </div>
    `;

    const fab = document.createElement("div");
    fab.className = "csf-fab";
    fab.innerHTML = `<div class="csf-dot"></div><div class="csf-label">Filter</div>`;

    fab.onclick = e => {
      e.stopPropagation();
      panel.style.display = panel.style.display === "none" ? "block" : "none";
      panel.querySelector(".csf-textarea").value = getIgnoreList().join("\n");
    };

    panel.querySelector(".csf-close").onclick = () => panel.style.display = "none";
    panel.querySelector(".csf-save").onclick = () => {
      setIgnoreList(parseTokens(panel.querySelector(".csf-textarea").value));
      applyFilter();
      panel.style.display = "none";
    };
    panel.querySelector(".csf-reset").onclick = () => {
      setIgnoreList(DEFAULT_IGNORE);
      setEnabled(true);
      applyFilter();
    };

    document.addEventListener("click", e => {
      if (!root.contains(e.target)) panel.style.display = "none";
    });

    root.append(panel, fab);
    document.body.appendChild(root);
  }

  function updateButtonState() {
    const dot = document.querySelector(".csf-dot");
    if (dot) dot.classList.toggle("off", !getEnabled());
  }

  new MutationObserver(applyFilter).observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  createUI();
  applyFilter();
})();
{% endraw %}
{% endcapture %}
{% assign cantrill_tm_script_trimmed = cantrill_tm_script | strip %}

**Note –** These study notes were captured while working through the excellent **[learn.cantrill.io](https://learn.cantrill.io/l/dashboard)** curriculum. 

To keep hide the **duplicate lessons** while branching across different study path, I also put together a **[TamperMonkey helper](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)** with the help of Codex — expand the block below if you ever need to copy it quickly.

<details class="code-snippet collapsible-snippet">
  <summary>
    <div class="code-snippet-header">
      <span>Cantrill curriculum helper script</span>
      <button type="button" class="copy-button" id="cantrill-tampermonkey-copy">Copy script</button>
    </div>
  </summary>
  <pre><code class="language-javascript" id="cantrill-tampermonkey-code">{{ cantrill_tm_script_trimmed | escape }}</code></pre>
</details>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var codeBlock = document.getElementById('cantrill-tampermonkey-code');
  var copyButton = document.getElementById('cantrill-tampermonkey-copy');

  if (!codeBlock || !copyButton) {
    return;
  }

  function showButtonStatus(message) {
    var originalText = copyButton.textContent;
    copyButton.textContent = message;
    copyButton.disabled = true;
    setTimeout(function() {
      copyButton.textContent = originalText;
      copyButton.disabled = false;
    }, 1800);
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    var copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (err) {
      copied = false;
    }

    document.body.removeChild(textarea);
    return copied;
  }

  copyButton.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();

    var scriptText = codeBlock.textContent.trim();
    if (!scriptText) {
      showButtonStatus('Script empty');
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(scriptText)
        .then(function() {
          showButtonStatus('Copied!');
        })
        .catch(function() {
          if (fallbackCopy(scriptText)) {
            showButtonStatus('Copied!');
          } else {
            showButtonStatus('Copy failed');
          }
        });
    } else if (fallbackCopy(scriptText)) {
      showButtonStatus('Copied!');
    } else {
      showButtonStatus('Copy failed');
    }
  });
});
</script>

---

## System Design Fundamentals {#system-design-fundamentals}

The following are system design fundamentals study pages:

<div class="study-tiles">
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/systemDesign' and p.url != '/study/' %}
    <a href="{{ p.url | relative_url }}" class="study-tile system-design">
      <div class="study-tile-title">
        <span class="study-tile-icon">📊</span>
        {{ p.title | default: p.url }}
      </div>
    </a>
  {% endif %}
{% endfor %}
</div>


---

## AI {#ai}

The following are AI study pages:

<div class="study-tiles">
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/ai' and p.url != '/study/' %}
    <a href="{{ p.url | relative_url }}" class="study-tile system-design">
      <div class="study-tile-title">
        <span class="study-tile-icon">🤖</span>
        {{ p.title | default: p.url }}
      </div>
    </a>
  {% endif %}
{% endfor %}
</div>

---

## Troubleshooting Practices {#troubleshooting-practices}

Practice your debugging and troubleshooting skills with hands-on Linux server challenges:

<div class="study-tiles">
  <a href="https://sadservers.com/" target="_blank" class="study-tile system-design">
    <div class="study-tile-title">
      <span class="study-tile-icon">🔧</span>
      SadServers - "Like LeetCode for Linux"
    </div>
    <div style="font-size: 14px; color: var(--muted); margin-top: 8px;">
      Excellent for SRE/DevOps interview preparation. Get a full remote Linux server with a problem and fix it!
    </div>
  </a>
</div>

---

## LeetCode {#leetcode}

The following are topic-specific coding interview study pages:

<div class="study-tiles">
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/coding' and p.url != '/study/' %}
    <a href="{{ p.url | relative_url }}" class="study-tile coding">
      <div class="study-tile-title">
        <span class="study-tile-icon">💻</span>
        {{ p.title | default: p.url }}
      </div>
    </a>
  {% endif %}
{% endfor %}
</div>

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
// @name         Cantrill Sidebar Filter (Ignore Tags)
// @namespace    cantrill-sidebar-filter
// @version      1.0.0
// @description  Hide sidebar items whose lecture title contains any configured ignore strings (e.g., [ASSOCIATESHARED], [SHAREDALL]).
// @match        https://learn.cantrill.io/courses/*/lectures/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
  "use strict";

  const KEY_ENABLED = "csf_enabled";
  const KEY_IGNORE_LIST = "csf_ignore_list";

  const DEFAULT_IGNORE = ["ASSOCIATESHARED", "SHAREDALL"];

  function getEnabled() {
    return GM_getValue(KEY_ENABLED, true);
  }

  function setEnabled(v) {
    GM_setValue(KEY_ENABLED, !!v);
  }

  function normalizeTokens(tokens) {
    return (tokens || [])
      .map(s => String(s).trim())
      .filter(Boolean);
  }

  function getIgnoreList() {
    const raw = GM_getValue(KEY_IGNORE_LIST, null);
    if (raw == null) return DEFAULT_IGNORE.slice();
    if (Array.isArray(raw)) return normalizeTokens(raw);
    // Back-compat if stored as string
    return normalizeTokens(String(raw).split(/[\n,]/g));
  }

  function setIgnoreList(tokens) {
    GM_setValue(KEY_IGNORE_LIST, normalizeTokens(tokens));
  }

  function promptEditIgnoreList() {
    const current = getIgnoreList();
    const input = window.prompt(
      "Enter ignore strings (comma or newline separated):\n\nExample:\nASSOCIATESHARED\nSHAREDALL",
      current.join("\n")
    );
    if (input == null) return; // cancelled
    const next = normalizeTokens(input.split(/[\n,]/g));
    setIgnoreList(next);
    applyFilter();
  }

  function shouldHideTitle(title, ignoreTokens) {
    if (!title) return false;
    const t = title.toLowerCase();
    return ignoreTokens.some(tok => t.includes(tok.toLowerCase()));
  }

  function applyFilter() {
    const enabled = getEnabled();
    const ignoreTokens = getIgnoreList();

    // Sidebar items are <li class="section-item ..."> and title in <span class="lecture-name"> ...  [oai_citation:1‡tmp.html](sediment://file_000000003b947207802b51a7eb258ae2)
    const items = document.querySelectorAll("li.section-item");
    items.forEach(li => {
      const titleEl = li.querySelector(".lecture-name");
      const title = titleEl ? titleEl.textContent : "";

      // If disabled, show everything
      if (!enabled) {
        li.style.removeProperty("display");
        li.removeAttribute("data-csf-hidden");
        return;
      }

      if (shouldHideTitle(title, ignoreTokens)) {
        li.style.display = "none";
        li.setAttribute("data-csf-hidden", "1");
      } else {
        // Only unhide things we hid (don’t fight the site’s own styles)
        if (li.getAttribute("data-csf-hidden") === "1") {
          li.style.removeProperty("display");
          li.removeAttribute("data-csf-hidden");
        }
      }
    });
  }

  function registerMenu() {
    GM_registerMenuCommand(`Cantrill Filter: ${getEnabled() ? "Disable" : "Enable"}`, () => {
      setEnabled(!getEnabled());
      applyFilter();
      // Quick refresh: Tampermonkey menu text won’t auto-update; reopen menu to see updated label.
    });

    GM_registerMenuCommand("Cantrill Filter: Edit ignore strings…", () => {
      promptEditIgnoreList();
    });

    GM_registerMenuCommand("Cantrill Filter: Reset ignore strings", () => {
      setIgnoreList(DEFAULT_IGNORE);
      applyFilter();
    });
  }

  function startObservers() {
    // Handles dynamic navigation / sidebar refresh
    const mo = new MutationObserver(() => applyFilter());
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Boot
  registerMenu();
  applyFilter();
  startObservers();
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
  <pre><code class="nohighlight" id="cantrill-tampermonkey-code">{{ cantrill_tm_script_trimmed | escape }}</code></pre>
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

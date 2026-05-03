// ==UserScript==
// @name         LeetCode Markdown Capture
// @namespace    https://glucolte.github.io/
// @version      0.3.6
// @description  Capture a LeetCode problem and solution as a markdown file for study/leetcodes/.
// @match        https://leetcode.com/problems/*
// @grant        GM_setClipboard
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const TARGET_FOLDER_HINT = '/Users/garylu/Documents/Repositories/glucolte.github.io/study/leetcodes';
  const DB_NAME = 'leetcode-markdown-capture';
  const DB_STORE = 'handles';
  const DB_KEY = 'leetcodes-folder';

  function pageApi() {
    const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    return {
      indexedDB: pageWindow.indexedDB || window.indexedDB,
      showDirectoryPicker: pageWindow.showDirectoryPicker || window.showDirectoryPicker,
      FileSystemDirectoryHandle: pageWindow.FileSystemDirectoryHandle || window.FileSystemDirectoryHandle
    };
  }

  function supportsFolderSave() {
    return typeof pageApi().showDirectoryPicker === 'function';
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'leetcode-problem';
  }

  function text(selector, root = document) {
    const node = root.querySelector(selector);
    return node ? node.textContent.trim() : '';
  }

  function collectVisibleText() {
    return document.body ? document.body.innerText : '';
  }

  function extractTitle() {
    const candidates = [
      '[data-cy="question-title"]',
      'div.text-title-large',
      'a[href^="/problems/"]'
    ];
    for (const selector of candidates) {
      const value = text(selector);
      if (/^\d+\.\s+/.test(value)) return value;
    }
    const match = collectVisibleText().match(/(^|\n)(\d+\.\s+[^\n]+)(\n|$)/);
    return match ? match[2].trim() : document.title.replace(/ - LeetCode$/, '').trim();
  }

  function extractDifficulty() {
    const body = collectVisibleText();
    const title = extractTitle();
    const afterTitle = body.slice(Math.max(0, body.indexOf(title)));
    const match = afterTitle.match(/\b(Easy|Medium|Hard)\b/);
    return match ? match[1] : '';
  }

  function extractTopics() {
    const topics = new Set();
    const anchors = Array.from(document.querySelectorAll('a[href*="/tag/"]'));
    anchors.forEach(anchor => {
      const value = anchor.textContent.trim();
      if (value && value.length <= 40) topics.add(value);
    });

    if (!topics.size) {
      const body = collectVisibleText();
      const topicBlock = body.match(/Topics\s+([\s\S]{0,500}?)(Companies|Similar Questions|Discussion|Accepted|$)/i);
      if (topicBlock) {
        topicBlock[1]
          .split(/\n+/)
          .map(v => v.trim())
          .filter(v => v && !/premium|lock|icon/i.test(v) && v.length <= 40)
          .forEach(v => topics.add(v));
      }
    }

    return Array.from(topics);
  }

  function extractCode() {
    const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const monaco = pageWindow.monaco || window.monaco;

    if (monaco && monaco.editor && typeof monaco.editor.getModels === 'function') {
      const modelValues = monaco.editor.getModels()
        .map(model => (typeof model.getValue === 'function' ? model.getValue() : ''))
        .map(value => value.trim())
        .filter(Boolean);

      const solutionLike = modelValues
        .filter(value => /class\s+Solution|function\s+|=>|def\s+|public\s+class|class\s+\w+/m.test(value))
        .sort((a, b) => b.length - a.length);

      if (solutionLike.length) return solutionLike[0];
      if (modelValues.length) return modelValues.sort((a, b) => b.length - a.length)[0];
    }

    const activeEditor = document.querySelector('.monaco-editor textarea.inputarea');
    if (activeEditor && activeEditor.value.trim()) return activeEditor.value.trim();

    const textareas = Array.from(document.querySelectorAll('textarea'));
    const codeTextarea = textareas.find(area => area.value && area.value.trim().length > 20);
    if (codeTextarea) return codeTextarea.value.trim();

    // Last resort only: Monaco renders just the visible viewport here, so this can be incomplete.
    return Array.from(document.querySelectorAll('.monaco-editor .view-line'))
      .map(line => line.textContent.replace(/\u00a0/g, ' '))
      .join('\n')
      .trim();
  }

  function languageFromPage() {
    const body = collectVisibleText();
    const known = ['Python3', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Ruby', 'Swift', 'Kotlin', 'Rust', 'PHP'];
    return known.find(lang => new RegExp(`\\b${lang.replace('+', '\\+')}\\b`).test(body)) || '';
  }


  function choosePrimaryPattern(topics) {
    const normalized = topics.map(topic => topic.toLowerCase());
    const groups = [
      { name: 'Dynamic Programming', keys: ['dynamic programming', 'memoization'] },
      { name: 'Backtracking', keys: ['backtracking'] },
      { name: 'Trees', keys: ['tree', 'binary tree', 'binary search tree', 'trie'] },
      { name: 'Graphs', keys: ['graph', 'breadth-first search', 'depth-first search', 'union find', 'topological sort', 'shortest path'] },
      { name: 'Linked Lists', keys: ['linked list'] },
      { name: 'Design Problems', keys: ['design', 'data stream', 'iterator'] },
      { name: 'Heaps & Priority Queues', keys: ['heap', 'priority queue'] },
      { name: 'Design Problems', keys: ['stack', 'queue'] },
      { name: 'Arrays & Strings', keys: ['array', 'string', 'hash table', 'two pointers', 'sliding window', 'sorting', 'binary search', 'matrix'] },
      { name: 'Math & Bit Manipulation', keys: ['math', 'bit manipulation', 'number theory', 'combinatorics'] }
    ];

    for (const group of groups) {
      if (group.keys.some(key => normalized.includes(key))) return group.name;
    }

    return topics[0] || 'Unsorted';
  }

  function frontMatterList(values) {
    if (!values.length) return 'topics: []';
    return 'topics:\n' + values.map(value => `  - "${String(value).replace(/"/g, '\\"')}"`).join('\n');
  }

  function buildMarkdown() {
    const fullTitle = extractTitle();
    const idMatch = fullTitle.match(/^(\d+)\.\s+(.+)$/);
    const id = idMatch ? idMatch[1] : '';
    const title = idMatch ? idMatch[2] : fullTitle;
    const difficulty = extractDifficulty();
    const topics = extractTopics();
    const primary = choosePrimaryPattern(topics);
    const url = location.origin + location.pathname.replace(/\/$/, '/') ;
    const code = extractCode();
    const language = languageFromPage();
    const slug = `${id ? id.padStart(4, '0') + '-' : ''}${slugify(title)}`;
    const filename = `${slug}.md`;
    const today = new Date().toISOString().slice(0, 10);
    const fencedLanguage = language.toLowerCase().replace('python3', 'python').replace('c++', 'cpp').replace('c#', 'csharp');

    const markdown = `---
layout: leetcode
title: "${title.replace(/"/g, '\\"')}"
permalink: /study/leetcodes/${slug}
${id ? `leetcode_id: ${Number(id)}\n` : ''}difficulty: ${difficulty || 'Unknown'}
leetcode_url: ${url}
primary_pattern: "${primary.replace(/"/g, '\\"')}"
${frontMatterList(topics)}
date_solved: ${today}
language: ${language || 'Unknown'}
---

# ${title}

- **Difficulty:** ${difficulty || 'Unknown'}
- **Primary pattern:** ${primary || 'Unsorted'}
- **Tags:** ${topics.length ? topics.join(', ') : 'Unsorted'}
- [LeetCode Link](${url})

## Key Idea

- 


## Solution

\`\`\`${fencedLanguage || 'text'}
${code || '// Paste solution here'}
\`\`\`

## Complexity

- Time:
- Space:
`;

    return { filename, markdown };
  }

  function openHandleDb() {
    return new Promise((resolve, reject) => {
      const dbApi = pageApi().indexedDB;
      if (!dbApi) {
        reject(new Error('IndexedDB is not available, so the target folder cannot be remembered.'));
        return;
      }

      const request = dbApi.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getStoredDirectoryHandle() {
    const db = await openHandleDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const request = tx.objectStore(DB_STORE).get(DB_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function setStoredDirectoryHandle(handle) {
    const db = await openHandleDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(handle, DB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function hasWritePermission(handle) {
    if (!handle) return false;
    const options = { mode: 'readwrite' };
    if ((await handle.queryPermission(options)) === 'granted') return true;
    return (await handle.requestPermission(options)) === 'granted';
  }

  async function chooseTargetFolder() {
    const api = pageApi();
    const picker = api.showDirectoryPicker;
    if (!picker) {
      throw new Error('Folder picker is not available. Use Chrome/Edge, reload LeetCode, then update/reinstall this userscript.');
    }

    const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const handle = await picker.call(pageWindow, {
      id: 'glucolte-leetcodes',
      mode: 'readwrite',
      startIn: 'documents'
    });

    if (!(await hasWritePermission(handle))) {
      throw new Error('Write permission was not granted for the selected folder.');
    }

    await setStoredDirectoryHandle(handle);
    return handle;
  }

  async function writeMarkdownToFolder(filename, markdown) {
    let folder = await getStoredDirectoryHandle();
    if (!(await hasWritePermission(folder))) {
      folder = await chooseTargetFolder();
    }

    const file = await folder.getFileHandle(filename, { create: true });
    const writable = await file.createWritable();
    await writable.write(markdown);
    await writable.close();
  }

  function openPreview() {
    const existing = document.getElementById('lc-md-capture-modal');
    if (existing) existing.remove();
    const data = buildMarkdown();

    const modal = document.createElement('div');
    modal.id = 'lc-md-capture-modal';
    modal.innerHTML = `
      <div class="lc-md-panel">
        <div class="lc-md-header">
          <div>
            <div class="lc-md-title">LeetCode Markdown Capture</div>
            <div class="lc-md-filename">${data.filename}</div>
          </div>
          <button class="lc-md-close" type="button" data-action="close" aria-label="Close">×</button>
        </div>
        <div class="lc-md-target">
          <span>Target folder</span>
          <code>${supportsFolderSave() ? TARGET_FOLDER_HINT : 'Browser download folder'}</code>
        </div>
        <textarea spellcheck="false"></textarea>
        <div class="lc-md-actions">
          <span class="lc-md-folder-hint">${supportsFolderSave()
            ? 'Choose the folder once, then Save writes the markdown file there.'
            : `Firefox cannot write directly to folders. Set Firefox downloads to ${TARGET_FOLDER_HINT}.`}</span>
          ${supportsFolderSave() ? '<button type="button" data-action="folder">Choose Folder</button>' : ''}
          <button type="button" data-action="copy">Copy Markdown</button>
          <button class="lc-md-primary" type="button" data-action="save">Save Markdown File</button>
        </div>
        <div class="lc-md-status" aria-live="polite"></div>
      </div>`;

    const style = document.createElement('style');
    style.textContent = `
      #lc-md-capture-modal { position: fixed; inset: 0; z-index: 999999; background: rgba(15, 23, 42, 0.58); display: grid; place-items: center; backdrop-filter: blur(3px); }
      #lc-md-capture-modal .lc-md-panel { width: min(980px, calc(100vw - 32px)); height: min(800px, calc(100vh - 32px)); background: #fff; color: #111827; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 24px 70px rgba(0,0,0,.3); display: flex; flex-direction: column; overflow: hidden; font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; }
      #lc-md-capture-modal .lc-md-header { align-items: center; background: #0f172a; color: #fff; display: flex; justify-content: space-between; gap: 16px; padding: 16px 18px; }
      #lc-md-capture-modal .lc-md-title { font-size: 15px; font-weight: 750; letter-spacing: .01em; }
      #lc-md-capture-modal .lc-md-filename { color: #cbd5e1; font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin-top: 3px; }
      #lc-md-capture-modal .lc-md-close { align-items: center; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18); border-radius: 999px; color: #fff; display: flex; font-size: 22px; height: 34px; justify-content: center; line-height: 1; padding: 0; width: 34px; }
      #lc-md-capture-modal .lc-md-target { background: #f8fafc; border-bottom: 1px solid #e5e7eb; color: #64748b; display: grid; gap: 4px; padding: 10px 18px; }
      #lc-md-capture-modal .lc-md-target span { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
      #lc-md-capture-modal .lc-md-target code { color: #334155; font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: normal; word-break: break-word; }
      #lc-md-capture-modal .lc-md-actions { align-items: center; background: #f8fafc; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; justify-content: flex-end; padding: 12px 14px; flex-wrap: wrap; }
      #lc-md-capture-modal .lc-md-folder-hint { color: #64748b; flex: 1 1 320px; font-size: 12px; line-height: 1.4; margin-right: auto; }
      #lc-md-capture-modal .lc-md-status { background: #fff; border-top: 1px solid #e5e7eb; color: #475569; min-height: 18px; padding: 9px 14px; font-size: 12px; line-height: 1.4; }
      #lc-md-capture-modal textarea { flex: 1; border: 0; background: #ffffff; color: #111827; resize: none; padding: 16px 18px; font: 13px/1.55 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; outline: none; }
      #lc-md-capture-modal button { border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #111827; cursor: pointer; font: 600 13px system-ui, sans-serif; padding: 9px 12px; }
      #lc-md-capture-modal button:hover { border-color: #94a3b8; background: #f1f5f9; }
      #lc-md-capture-modal .lc-md-primary { background: #f97316; border-color: #f97316; color: #fff; }
      #lc-md-capture-modal .lc-md-primary:hover { background: #ea580c; border-color: #ea580c; }
    `;
    modal.appendChild(style);
    modal.querySelector('textarea').value = data.markdown;
    document.body.appendChild(modal);

    modal.addEventListener('click', async event => {
      const action = event.target && event.target.dataset ? event.target.dataset.action : '';
      if (!action) return;
      const status = modal.querySelector('.lc-md-status');
      const setStatus = message => {
        status.textContent = message;
      };
      if (action === 'close') modal.remove();
      if (action === 'copy') {
        const value = modal.querySelector('textarea').value;
        if (typeof GM_setClipboard === 'function') GM_setClipboard(value);
        else await navigator.clipboard.writeText(value);
        setStatus('Copied markdown to clipboard.');
      }
      if (action === 'folder') {
        try {
          await chooseTargetFolder();
          setStatus('Folder saved. Future captures can write there directly.');
        } catch (error) {
          setStatus(error.message || 'Could not save the folder handle.');
        }
      }
      if (action === 'save') {
        const value = modal.querySelector('textarea').value;
        try {
          if (!supportsFolderSave()) {
            throw new Error('Folder picker is unavailable in Firefox. Downloading markdown instead.');
          }
          await writeMarkdownToFolder(data.filename, value);
          setStatus(`Saved ${data.filename} to the selected leetcodes folder.`);
        } catch (error) {
          setStatus(error.message || 'Folder save failed. Downloading markdown instead.');
          const blob = new Blob([value], { type: 'text/markdown;charset=utf-8' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = data.filename;
          link.click();
          URL.revokeObjectURL(link.href);
        }
      }
    });
  }

  function addButton() {
    if (document.getElementById('lc-md-capture-button')) return;
    const mount = document.body || document.documentElement;
    if (!mount) return;

    const button = document.createElement('button');
    button.id = 'lc-md-capture-button';
    button.type = 'button';
    button.textContent = 'Save MD';
    button.title = 'Capture LeetCode markdown';
    button.style.cssText = 'all:unset;position:fixed;right:24px;bottom:24px;z-index:2147483647;box-sizing:border-box;border-radius:999px;background:#f97316;color:#fff;cursor:pointer;font:700 15px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;padding:14px 18px;box-shadow:0 12px 32px rgba(249,115,22,.45),0 4px 14px rgba(0,0,0,.22);letter-spacing:.01em;';
    button.addEventListener('click', openPreview);
    mount.appendChild(button);
  }

  function bootButton() {
    addButton();
    window.setTimeout(addButton, 500);
    window.setTimeout(addButton, 1500);
    window.setInterval(addButton, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootButton, { once: true });
  } else {
    bootButton();
  }

  new MutationObserver(addButton).observe(document.documentElement, { childList: true, subtree: true });
}());

---
layout: leetcode
title: leetcode
permalink: /study/codingLeetcode
---

# LeetCode

This is my coding interview notebook: pattern reminders at the top, and one markdown page per completed problem underneath. The problem pages live in `study/leetcodes/`, so new captures from the Tampermonkey script can be added without deciding which topic file owns the question.

Use the pattern sections as a quick diagnosis checklist before solving. LeetCode tags can overlap heavily, so the important split here is the main thinking pattern, not every possible tag.

## Pattern Notes

<section class="leetcode-patterns">
  <article class="leetcode-pattern-block">
    <h3>Arrays & Strings</h3>
    <p>Use this bucket for flat sequence problems where the core work is scanning, comparing, grouping, or maintaining a window.</p>
    <h4>Patterns to know</h4>
    <ul>
      <li>Two pointers: fast/slow, inward/outward, sorted pair search.</li>
      <li>Sliding window for longest, shortest, or counted substring/subarray constraints.</li>
      <li>Prefix sum and difference array for repeated range calculations.</li>
      <li>Sorting plus greedy when order unlocks a simpler local choice.</li>
      <li>Binary search on index or answer space.</li>
    </ul>
    <h4>How to identify</h4>
    <p>The input is mainly an array or string, and the question asks for a pair, triplet, range, substring, frequency, or ordered scan.</p>
  </article>

  <article class="leetcode-pattern-block">
    <h3>Dynamic Programming</h3>
    <p>Use this when the answer can be built from smaller repeated states and a local decision contributes to a global optimum or count.</p>
    <h4>Patterns to know</h4>
    <ul>
      <li>1D DP for Fibonacci-style transitions, house robber, and simple recurrence states.</li>
      <li>2D grid DP for unique paths, minimum path sum, and obstacle grids.</li>
      <li>Subsequence DP for LIS, LCS, edit distance, and matching problems.</li>
      <li>Knapsack, interval DP, state machines, bitmask DP, and digit DP for richer state design.</li>
    </ul>
    <h4>How to identify</h4>
    <p>Look for maximum/minimum ways, cost, length, repeated subproblems, or a recursive brute force that keeps recomputing the same state.</p>
  </article>

  <article class="leetcode-pattern-block">
    <h3>Trees</h3>
    <p>Tree problems are usually about choosing the right traversal and deciding what each recursive call should return to its parent.</p>
    <h4>Patterns to know</h4>
    <ul>
      <li>DFS preorder, inorder, and postorder.</li>
      <li>BFS level order with a queue.</li>
      <li>Divide and conquer for height, balance, diameter, path sum, and subtree checks.</li>
      <li>BST-specific inorder ordering and binary-search-like pruning.</li>
      <li>Lowest common ancestor and ancestor/path tracking.</li>
    </ul>
    <h4>How to identify</h4>
    <p>The input is `root`, or the problem talks about height, depth, level, ancestor, subtree, balanced, path, or BST order.</p>
  </article>

  <article class="leetcode-pattern-block">
    <h3>Graphs</h3>
    <p>Graph questions are about relationships: reachability, connectivity, ordering, shortest path, or traversing a grid as implicit nodes.</p>
    <h4>Patterns to know</h4>
    <ul>
      <li>BFS and DFS for traversal, islands, and connected components.</li>
      <li>Union-find for grouping and cycle detection.</li>
      <li>Topological sort for prerequisites and dependency order.</li>
      <li>Dijkstra or Bellman-Ford for weighted shortest paths.</li>
    </ul>
    <h4>How to identify</h4>
    <p>The input has nodes and edges, a 2D grid with movement, prerequisites, components, cycles, or a shortest path requirement.</p>
  </article>

  <article class="leetcode-pattern-block">
    <h3>Design Problems</h3>
    <p>Design problems ask you to maintain state across method calls while meeting operation complexity constraints.</p>
    <h4>Patterns to know</h4>
    <ul>
      <li>Hash map plus linked list for LRU-style ordering.</li>
      <li>Hash map plus array for randomized set operations.</li>
      <li>Queue/deque for recent-event windows, rate limiters, and hit counters.</li>
      <li>Heap or ordered structures when min/max priority matters.</li>
    </ul>
    <h4>How to identify</h4>
    <p>The prompt asks you to implement a class with operations such as `push`, `pop`, `get`, `put`, `add`, or `remove`.</p>
  </article>

  <article class="leetcode-pattern-block">
    <h3>Backtracking</h3>
    <p>Backtracking is controlled brute force: build a candidate, recurse, then undo the choice cleanly.</p>
    <h4>Patterns to know</h4>
    <ul>
      <li>Subsets, combinations, and permutations.</li>
      <li>Board search such as word search, N-Queens, and Sudoku.</li>
      <li>Pruning invalid branches early.</li>
    </ul>
    <h4>How to identify</h4>
    <p>The problem asks for all possible solutions, all valid arrangements, or all combinations under constraints.</p>
  </article>

  <article class="leetcode-pattern-block">
    <h3>Heaps & Priority Queues</h3>
    <p>Use heaps when you repeatedly need the current smallest, largest, or best candidate without fully sorting every time.</p>
    <h4>Patterns to know</h4>
    <ul>
      <li>Kth largest or smallest.</li>
      <li>Top-k frequent elements.</li>
      <li>Merge k sorted streams.</li>
      <li>Scheduling and running median style problems.</li>
    </ul>
    <h4>How to identify</h4>
    <p>The problem repeatedly asks for min/max, top-k, or the next best item while data changes.</p>
  </article>

  <article class="leetcode-pattern-block">
    <h3>Linked Lists</h3>
    <p>Linked list problems are pointer discipline problems. The main risk is losing references or mishandling edge cases.</p>
    <h4>Patterns to know</h4>
    <ul>
      <li>Fast/slow pointers for cycles and middle nodes.</li>
      <li>Dummy nodes for cleaner insert/delete logic.</li>
      <li>Full or partial reversal.</li>
      <li>Merge two lists or k lists.</li>
    </ul>
    <h4>How to identify</h4>
    <p>The input involves nodes with `.next`, or the prompt asks to reverse, reorder, merge, detect a cycle, or remove nodes.</p>
  </article>

  <article class="leetcode-pattern-block">
    <h3>Math & Bit Manipulation</h3>
    <p>This bucket is for problems where the trick is an arithmetic property, representation detail, or binary operation.</p>
    <h4>Patterns to know</h4>
    <ul>
      <li>GCD, LCM, divisibility, modulo, and fast exponentiation.</li>
      <li>XOR identities and bit masks.</li>
      <li>Counting bits, powers of two, and subset representation.</li>
    </ul>
    <h4>How to identify</h4>
    <p>Constraints are very large, the prompt mentions modulo/divisibility, or the solution depends on binary representation.</p>
  </article>
</section>

## Completed Questions

<div class="leetcode-controls" aria-label="LeetCode problem filters">
  <input id="leetcode-search" class="leetcode-search" type="search" placeholder="Search questions or tags" aria-label="Search LeetCode questions">
  <select id="leetcode-difficulty" class="leetcode-select" aria-label="Filter by difficulty">
    <option value="">All difficulties</option>
    <option value="Easy">Easy</option>
    <option value="Medium">Medium</option>
    <option value="Hard">Hard</option>
  </select>
</div>

<table class="leetcode-table" id="leetcode-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Question</th>
      <th>Difficulty</th>
      <th>Primary Pattern</th>
      <th>Tags</th>
      <th>Solved</th>
    </tr>
  </thead>
  <tbody>
    {% assign leetcode_pages = site.pages | sort: "title" %}
    {% for p in leetcode_pages %}
      {% if p.path contains "study/leetcodes/" %}
        <tr data-title="{{ p.title | downcase | escape }}" data-difficulty="{{ p.difficulty | escape }}" data-topics="{{ p.topics | join: ', ' | downcase | escape }} {{ p.primary_pattern | downcase | escape }}">
          <td class="leetcode-id">{% if p.leetcode_id %}{{ p.leetcode_id | prepend: "0000" | slice: -4, 4 }}{% endif %}</td>
          <td><a href="{{ p.url | relative_url }}">{{ p.title }}</a></td>
          <td>{% if p.difficulty %}<span class="leetcode-pill difficulty-{{ p.difficulty | downcase }}">{{ p.difficulty }}</span>{% endif %}</td>
          <td>{{ p.primary_pattern }}</td>
          <td>{{ p.topics | join: ", " }}</td>
          <td>{{ p.date_solved | default: "" }}</td>
        </tr>
      {% endif %}
    {% endfor %}
  </tbody>
</table>

<div class="leetcode-pagination">
  <button id="leetcode-prev" type="button">Previous</button>
  <span id="leetcode-page-status"></span>
  <button id="leetcode-next" type="button">Next</button>
</div>

<script>
(function () {
  const pageSize = 15;
  const rows = Array.from(document.querySelectorAll('#leetcode-table tbody tr'));
  const search = document.getElementById('leetcode-search');
  const difficulty = document.getElementById('leetcode-difficulty');
  const prev = document.getElementById('leetcode-prev');
  const next = document.getElementById('leetcode-next');
  const status = document.getElementById('leetcode-page-status');
  let page = 1;

  function filteredRows() {
    const q = (search.value || '').trim().toLowerCase();
    const d = difficulty.value;
    return rows.filter(row => {
      const text = `${row.dataset.title || ''} ${row.dataset.topics || ''}`;
      const matchesSearch = !q || text.includes(q);
      const matchesDifficulty = !d || row.dataset.difficulty === d;
      return matchesSearch && matchesDifficulty;
    });
  }

  function render() {
    const visible = filteredRows();
    const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
    page = Math.min(page, totalPages);
    rows.forEach(row => row.hidden = true);
    visible.slice((page - 1) * pageSize, page * pageSize).forEach(row => row.hidden = false);
    status.textContent = `${visible.length} questions · page ${page} of ${totalPages}`;
    prev.disabled = page <= 1;
    next.disabled = page >= totalPages;
  }

  search.addEventListener('input', () => { page = 1; render(); });
  difficulty.addEventListener('change', () => { page = 1; render(); });
  prev.addEventListener('click', () => { page -= 1; render(); });
  next.addEventListener('click', () => { page += 1; render(); });
  render();
}());
</script>

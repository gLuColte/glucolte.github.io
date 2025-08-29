---
title: study
permalink: /study/
---

# /study

A home for study resources, with a focus on **coding interview prep**.  
Start with the **Foundations** to build the right mental models, then dive into the topic pages listed below.

---

## Foundations (Read First)

### 1) Mindset & Workflow
- **Read → Model → Plan → Code → Check → Optimize**
  1. Restate the problem & constraints (time/space limits, inputs, edge cases).
  2. Pick the **data structure** and **pattern** (see map below).
  3. Start with the simplest correct version; optimize after it passes.
- Prefer **O(n)** / **O(n log n)**; know when **O(n²)** is acceptable (small n).
- Use **examples** and a tiny **trace** before coding.

### 2) Pattern Recognition Map
- **Arrays/Strings** → two pointers, sliding window, prefix sum.
- **Linked List** → fast/slow pointers, reverse, merge.
- **Tree** → DFS recursion (pre/in/post), BFS level order, LCA, subtree combine.
- **Graph / Grid** → BFS/DFS, Union-Find, topo sort, Dijkstra (weighted).
- **Dynamic Programming** → “max/min/ways/cost” + overlapping subproblems.
- **Backtracking** → “list all / count all” with choices + pruning.
- **Greedy** → sort + always take local best (prove or counterexample).
- **Heap** → kth/top-k, merge k streams, repeated min/max extraction.
- **Hashing** → O(1) lookup, frequency maps, de-dup.

### 3) Recursion (the engine under many categories)
- Works when the problem **decomposes into same-shaped subproblems**.
- Start with **recursive definition**, add **memoization** (top-down), then convert to **tabulation** (bottom-up) if needed.
- Always define: `state`, `transition`, `base case`.

### 4) Choosing the Right Approach (Quick Rules)
- **Shortest steps on grid / unweighted graph** → **BFS**.
- **Shortest cost with non-negative weights** → **Dijkstra** (priority queue).
- **“Max/Min/Count ways” with overlapping subproblems** → **DP**.
- **“All configurations / subsets / permutations”** → **Backtracking**.
- **Intervals scheduling/merging** → sort + **Greedy** or sweep line.
- **Kth / top-k** → **Heap** (or Quickselect for kth).

### 5) Data Structure Toolkit (minimal viable set)
- **Array / String**: pointers, windows, prefix sums.
- **HashMap / HashSet**: counting & O(1) membership.
- **Deque**: monotonic queue for sliding window max/min.
- **Heap**: min/max priority.
- **Union-Find (DSU)**: components & cycle detect.
- **Trie** (nice-to-have): prefix queries, word break variants.

### 6) How to Identify DP Fast
- The prompt asks: **min/max/ways/true-false** under constraints.
- Subproblems **overlap**; the optimal solution **builds from smaller ones**.
- You can write a recursion `f(i, …)` whose result reappears often.
- Turn that into:
  - **Memoization**: cache `f(i, …)` results.
  - **Tabulation**: order states so dependencies come first.
- Common DP families: **Knapsack**, **LIS/LCS**, **Edit Distance**, **Grid paths**, **Stock (state machine)**, **Interval DP**, **Bitmask DP**, **Digit DP**.

### 7) Complexity Rules (Big-O Cheat-Sheet)
- **Additive:** independent parts add:  
  - Example: scanning array `O(n)` + scanning string `O(m)` → **O(n + m)**.
- **Multiplicative (nested):** loops inside loops multiply:  
  - Double loop over `n` → **O(n²)**.  
  - Loop over `n`, inner loop over `m` → **O(n·m)**.
- **Sorting:** standard sort = **O(n log n)**.
- **Graph terms:**  
  - `n` = nodes, `m` = edges.  
  - BFS/DFS runs in **O(n + m)**.  
  - Dijkstra (heap) runs in **O((n + m) log n)**.  
- **Hashing:** HashMap/Set ops average **O(1)**, worst-case **O(n)**.
- **Divide & Conquer:** recurrence → often **O(n log n)** (e.g. mergesort).
- **Space vs Time tradeoff:**  
  - Memoization / DP uses **O(n)** or **O(n²)** memory to speed recursion.  
  - Sliding window reduces space from **O(n)** → **O(1)**.

👉 Always express in terms of **input size** (`n`, `m`) or problem-specific parameters.

### 8) When You’re Stuck (90-second checklist)
- Can I **sort** to simplify?
- Can I **scan once** with a **window** or **prefix**?
- Is there a **graph view** (nodes/edges)? If yes, **BFS/DFS/UF/Dijkstra**.
- Can I define `dp[i][…]` or `f(i, …)` with clear **base** and **transition**?
- Can I **greedy** by proving an exchange argument?
- Did I try a **small example** and write down states?

---

## Coding
Introduction: curated topic pages below (auto-generated). Start with **Arrays & Strings**, then **Hashing**, **Trees/Graphs**, and **Dynamic Programming**. Revisit Foundations whenever you hit friction.

<ul>
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/coding' and p.url != '/study/' %}
    <li><a href="{{ p.url | relative_url }}">{{ p.title | default: p.url }}</a></li>
  {% endif %}
{% endfor %}
</ul>

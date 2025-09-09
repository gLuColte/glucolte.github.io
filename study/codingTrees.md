---
title: trees
permalink: /study/codingTrees
---

**Patterns to know**

* **DFS Traversals (Depth-First)**

  * Preorder (Root → Left → Right)
  * Inorder (Left → Root → Right) → sorted order in BST
  * Postorder (Left → Right → Root)
* **BFS Traversals (Breadth-First)**

  * Level Order (by queue)
* **Divide & Conquer**

  * Build / validate BST
  * Lowest Common Ancestor (LCA)
  * Subtree problems (check subtree, serialize/compare)
* **Path Problems**

  * Path Sum, Maximum Path Sum
  * Diameter of Binary Tree
  * Root-to-leaf paths (collect, count)
* **Other Patterns**

  * Serialization / Deserialization
  * Flattening / converting tree structures (to linked list, array, etc.)
  * Traversal without recursion (stack / Morris traversal)

---

**How to identify**

* Input is `root` (not array) → tree problem.
* Ask yourself:

  * **“Do I need nodes in sorted order?”** → Inorder DFS.
  * **“Do I need to process parents before children?”** → Preorder.
  * **“Do I need to clean up bottom-up?”** → Postorder.
  * **“Do I need level by level / shortest path?”** → BFS.
  * **“Is it about balancing / height / max depth?”** → DFS with return values.
  * **“Is it about ancestors?”** → LCA pattern.

---

**Traversals in a nutshell**

For node `N`:

* **Preorder:** `N → Left → Right`
* **Inorder:** `Left → N → Right`
* **Postorder:** `Left → Right → N`
* **Level Order:** visit nodes by levels (queue).

Example tree:

```
      4
     / \
    2   5
   / \
  1   3
```

* Preorder → \[4,2,1,3,5]
* Inorder → \[1,2,3,4,5]
* Postorder → \[1,3,2,5,4]
* Level order → \[\[4],\[2,5],\[1,3]]

---

**Common interview problems by category**

* **Traversal:** Binary Tree Inorder Traversal, Level Order Traversal.
* **Path:** Path Sum I/II, Diameter of Tree, Max Path Sum.
* **BST:** Validate BST, Convert Sorted Array to BST, Kth Smallest in BST.
* **LCA:** Lowest Common Ancestor in BST, in Binary Tree.
* **Construction:** Build Tree from Preorder+Inorder, Serialize & Deserialize Binary Tree.
* **Properties:** Balanced Binary Tree, Symmetric Tree, Invert/Flip Tree.

---

⚡ Pro tip:
Whenever you see “**sum, max, height, balanced, depth, diameter**,” think **DFS recursion with a return value**.
Whenever you see “**level, closest, shortest path, zigzag**,” think **BFS with a queue**.

---



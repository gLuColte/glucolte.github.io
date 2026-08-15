---
layout: leetcode
title: "Invert Binary Tree"
permalink: /study/leetcodes/0226-invert-binary-tree
leetcode_id: 226
difficulty: Easy
leetcode_url: https://leetcode.com/problems/invert-binary-tree/description/
primary_pattern: "Trees"
topics:
  - "Tree"
  - "Depth-First Search"
  - "Breadth-First Search"
  - "Binary Tree"
date_solved: 2026-08-15
time_taken: "04:11"
language: Python3
---

# Invert Binary Tree

- **Difficulty:** Easy
- **Primary pattern:** Trees
- **Tags:** Tree, Depth-First Search, Breadth-First Search, Binary Tree
- **Time taken:** 04:11
- [LeetCode Link](https://leetcode.com/problems/invert-binary-tree/description/)

## Key Idea

- Recursion
- Break down problem to sub problem, that has a pattern that can be solved in a sub function


## Solution

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        # Recursion
            # This is a tree graph, we need to make right = left, and left = right
        if not root:
            return None
        # Recursive Call
        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root
```

## Complexity

- Time: O(n) - Every node is visited exactly once
- Space: O(h) - height of the tree dependency

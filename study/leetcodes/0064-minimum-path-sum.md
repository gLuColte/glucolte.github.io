---
layout: leetcode
title: "Minimum Path Sum"
permalink: /study/leetcodes/0064-minimum-path-sum
leetcode_id: 64
difficulty: Medium
leetcode_url: https://leetcode.com/problems/minimum-path-sum/description/
primary_pattern: "Dynamic Programming"
topics:
  - "Array"
  - "Dynamic Programming"
  - "Matrix"
date_solved: 2026-05-16
time_taken: "21:16"
language: Python3
---

# Minimum Path Sum

- **Difficulty:** Medium
- **Primary pattern:** Dynamic Programming
- **Tags:** Array, Dynamic Programming, Matrix
- **Time taken:** 21:16
- [LeetCode Link](https://leetcode.com/problems/minimum-path-sum/description/)

## Key Idea

- Similar to other DP question
- But you are finding Minimum Sum -> min(top cell, left cell) + current cell
- At the end you return the end cell


## Solution

```python
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        # Minimized sum
        # Need to traverse
        m = len(grid)
        n = len(grid[0])
        dp = [[0] * n for _ in range(m)]
        dp[0][0] = grid[0][0]
        # First Row
        for j in range(1,n):
            dp[0][j] = dp[0][j-1] + grid[0][j]
        # First column
        for i in range(1,m):
            dp[i][0] = dp[i-1][0] + grid[i][0]
        # Iterate
        for i in range(1,m):
            for j in range(1,n):
                # You add the current cell + Min(Left, Top)
                dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
        return dp[m-1][n-1]
```

## Complexity

- Time: O(mn)
- Space: O(1)

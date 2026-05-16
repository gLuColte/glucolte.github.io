---
layout: leetcode
title: "Unique Paths"
permalink: /study/leetcodes/0062-unique-paths
leetcode_id: 62
difficulty: Medium
leetcode_url: https://leetcode.com/problems/unique-paths/description/
primary_pattern: "Dynamic Programming"
topics:
  - "Math"
  - "Dynamic Programming"
  - "Combinatorics"
date_solved: 2026-05-16
time_taken: "02:42"
language: Python3
---

# Unique Paths

- **Difficulty:** Medium
- **Primary pattern:** Dynamic Programming
- **Tags:** Math, Dynamic Programming, Combinatorics
- **Time taken:** 02:42
- [LeetCode Link](https://leetcode.com/problems/unique-paths/description/)

## Key Idea

- Understand the number of ways to reach a cell = ways from top + ways from left:
```
1  1  1  1  1  1  1
1  2  3  4  5  6  7
1  3  6 10 15 21 28
```
- From there, you are looking into a matrix manipulation. Start from a clean DP, then walk your way through each cell

## Solution

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        # Return the number of possible unique paths that the robot can take to reach the bottom right corner
        # Initialize the DP
        dp = [[1] * n for _ in range(m)]

        for i in range(1,m):
            for j in range(1,n):
                # Add
                dp[i][j] = dp[i-1][j] + dp[i][j-1]
        return dp[m-1][n-1]
```

## Complexity

- Time: O(mn)
- Space: O(n)

---
layout: leetcode
title: "Unique Paths II"
permalink: /study/leetcodes/0063-unique-paths-ii
leetcode_id: 63
difficulty: Medium
leetcode_url: https://leetcode.com/problems/unique-paths-ii/description/
primary_pattern: "Dynamic Programming"
topics:
  - "Array"
  - "Dynamic Programming"
  - "Matrix"
date_solved: 2026-05-16
time_taken: "00:00"
language: Python3
---

# Unique Paths II

- **Difficulty:** Medium
- **Primary pattern:** Dynamic Programming
- **Tags:** Array, Dynamic Programming, Matrix
- **Time taken:** 00:00
- [LeetCode Link](https://leetcode.com/problems/unique-paths-ii/description/)

## Key Idea

- Use a DP matrix
- Reverting the Obstacle Grid does not give you the DP, as an example:
```
obstacleGrid = [
    [0,1,0],
    [0,0,0],
    [0,0,0]
]
dp = [
    [1,0,1],
    [1,1,1],
    [1,1,1]
]
```
- Hence you need the initialization to convert it to:
```
dp = [
    [1,0,0],
    [1,1,1],
    [1,1,1]
]
```

## Solution

```python
class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:

        # Dynamic Programming problem
        m = len(obstacleGrid)
        n = len(obstacleGrid[0])
        dp = [[ 1 - value for value in row] for row in obstacleGrid]
        
        # Edge case
        if dp[0][0] == 0:
            return 0
        
        # Initialize first column
        for i in range(1, m):
            dp[i][0] = dp[i][0] * dp[i - 1][0]

        # Initialize first row
        for j in range(1, n):
            dp[0][j] = dp[0][j] * dp[0][j - 1]

        # ObstacleGrid
        # 0,0,0
        # 0,1,0
        # 0,0,0

        # DP - Basically the "reverted"
        # 1,1,1
        # 1,0,1
        # 1,1,1

        # We can NOT include a bath that is marked 1
        for i in range(1,m):
            for j in range(1,n):
                if obstacleGrid[i][j] == 0:
                    dp[i][j] = dp[i-1][j] + dp[i][j-1] 
                else:
                    dp[i][j] = 0
        return dp[m-1][n-1]
```

## Complexity

- Time: O(mn)
- Space: O(mn)

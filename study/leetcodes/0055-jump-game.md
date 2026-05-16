---
layout: leetcode
title: "Jump Game"
permalink: /study/leetcodes/0055-jump-game
leetcode_id: 55
difficulty: Medium
leetcode_url: https://leetcode.com/problems/jump-game/
primary_pattern: "Dynamic Programming"
topics:
  - "Array"
  - "Dynamic Programming"
  - "Greedy"
date_solved: 2026-05-16
time_taken: "00:00"
language: Python3
---

# Jump Game

- **Difficulty:** Easy
- **Primary pattern:** Dynamic Programming
- **Tags:** Array, Dynamic Programming, Greedy
- **Time taken:** 00:00
- [LeetCode Link](https://leetcode.com/problems/jump-game/)

## Key Idea

- Move through the array index by index. At each index, first check whether this index is still within the farthest position that previous jumps could reach. If the index is beyond that farthest reachable position, then I am stuck and should return False.
- If the index is reachable, then use the current index to update the farthest position I can reach from here: i + nums[i]. If this gives me a farther position than before, extend my reachable boundary. If the boundary reaches or passes the last index, return True.
- You are not planning the exact path forward; You are verifying each reachable step and using it to expand how far the path could go.

## Solution

```python
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        # Initialize
        farthest_position = 0
        for i in range(len(nums)):
            # If current index is beyond what we can reach, we are stuck
            if i > farthest_position:
                return False
            # Update the farthest place we can reach
            farthest_position = max(farthest_position, i + nums[i])
            # If we can reach or pass the last index, success
            if farthest_position >= len(nums) - 1:
                return True
        return True
```

## Complexity

- Time: O(n)
- Space: O(1)

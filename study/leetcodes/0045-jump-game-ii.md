---
layout: leetcode
title: "Jump Game II"
permalink: /study/leetcodes/0045-jump-game-ii
leetcode_id: 45
difficulty: Medium
leetcode_url: https://leetcode.com/problems/jump-game-ii/description/
primary_pattern: "Dynamic Programming"
topics:
  - "Array"
  - "Dynamic Programming"
  - "Greedy"
date_solved: 2026-05-16
time_taken: "09:12"
language: Python3
---

# Jump Game II

- **Difficulty:** Medium
- **Primary pattern:** Dynamic Programming
- **Tags:** Array, Dynamic Programming, Greedy
- **Time taken:** 09:12
- [LeetCode Link](https://leetcode.com/problems/jump-game-ii/description/)

## Key Idea

1. Jump Game II is like BFS by ranges: each jump creates a reachable range of indices, and you scan that whole range before counting the next jump.
2. Inside the current range, you do not care exactly which index you land on yet; you only track the farthest next range you can unlock.
3. The key here is to increment and compare against the current end. The Loop may still keep going

## Solution

```python
class Solution:
    def jump(self, nums: List[int]) -> int:
        # Inputs: List[int]
        # Output: int
        # Descrption
            # Each emember represents the maximum length of a forward jump from index i
            # that means you can jump 0 <= j <= nums[i]
            # Find MINIMUM number of jumps to reach index n-1
            # Test are generated such that you can ALWAYS reach index n-1

        # Initialize
        jumps = 0
        current_end = 0
        farthest_position = 0

        for i in range(len(nums) - 1):
            # Update the farthest we can reach from this range
            farthest_position = max(farthest_position, i + nums[i])
            # If we reached the end of current jump range
            # we must take another jump
            if i == current_end:
                jumps += 1
                current_end = farthest_position
        return jumps
``` 

## Complexity

- Time: O(n)
- Space: O(1)

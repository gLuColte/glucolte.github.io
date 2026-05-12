---
layout: leetcode
title: "Container With Most Water"
permalink: /study/leetcodes/0011-container-with-most-water
leetcode_id: 11
difficulty: Medium
leetcode_url: https://leetcode.com/problems/container-with-most-water/submissions/2001417498/
primary_pattern: "Arrays & Strings"
topics:
  - "Array"
  - "Two Pointers"
  - "Greedy"
date_solved: 2026-05-12
time_taken: "00:01"
language: Python3
---

# Container With Most Water

- **Difficulty:** Unknown
- **Primary pattern:** Arrays & Strings
- **Tags:** Array, Two Pointers, Greedy
- **Time taken:** 00:01
- [LeetCode Link](https://leetcode.com/problems/container-with-most-water/submissions/2001417498/)

## Key Idea

- Understand the pointer system and using width * height
- Brute force is using nested loop
- Cleaner approach is to start with FULL rectangle, with maximum width, then Move the shorter side inward


## Solution

```python
class Solution:
    def maxArea(self, height: List[int]) -> int:
        left_pointer = 0
        right_pointer = len(height) - 1

        max_volume = 0

        while left_pointer < right_pointer:
            # Width is the distance between the two lines
            width = right_pointer - left_pointer

            # Water height is limited by the shorter line
            water_height = min(height[left_pointer], height[right_pointer])

            # Current container area
            volume = width * water_height

            # Update max volume
            if volume > max_volume:
                max_volume = volume

            # Move the shorter side inward
            # because the shorter side is the limiting factor
            if height[left_pointer] < height[right_pointer]:
                left_pointer += 1
            else:
                right_pointer -= 1

        return max_volume
```

## Complexity

- Time: O(n)
- Space: O(1)

---
layout: leetcode
title: "Maximum Subarray"
permalink: /study/leetcodes/0053-maximum-subarray
leetcode_id: 53
difficulty: Medium
leetcode_url: https://leetcode.com/problems/maximum-subarray/submissions/2004330407/
primary_pattern: "Dynamic Programming"
topics:
  - "Array"
  - "Divide and Conquer"
  - "Dynamic Programming"
date_solved: 2026-05-16
time_taken: "12:20"
language: Python3
---

# Maximum Subarray

- **Difficulty:** Easy
- **Primary pattern:** Dynamic Programming
- **Tags:** Array, Divide and Conquer, Dynamic Programming
- **Time taken:** 12:20
- [LeetCode Link](https://leetcode.com/problems/maximum-subarray/submissions/2004330407/)

## Key Idea

- GPT assisted
- This is Kadane Algorithm
- Do not restart when adding a number makes the sum smaller.
- Restart only when starting from the current number is better than carrying the previous sum.


## Solution

```python
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # Inputs: List[int]
        # Output: int
        # Descrption:
            # nums, find subarray with the largest sum and RETURN its sum
            # Subarray so it has to be in order

        # Initialize
        running_sum = nums[0]
        max_sum = nums[0]
        for pointer in range(1, len(nums)):
            num = nums[pointer]
            # continue previous subarray OR start fresh at current number
            running_sum = max(running_sum + num, num)
            # remember the best result seen so far
            max_sum = max(max_sum, running_sum)

        return max_sum
```

## Complexity

- Time: O(n)
- Space: O(1)

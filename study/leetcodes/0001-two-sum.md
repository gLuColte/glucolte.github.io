---
layout: leetcode
title: "Two Sum"
permalink: /study/leetcodes/0001-two-sum
leetcode_id: 1
difficulty: Easy
leetcode_url: https://leetcode.com/problems/two-sum/description/
primary_pattern: "Arrays & Strings"
topics:
  - "Array"
  - "Hash Table"
date_solved: 2026-05-03
time_taken: "02:19"
language: Python3
---

# Two Sum

- **Difficulty:** Easy
- **Primary pattern:** Arrays & Strings
- **Tags:** Array, Hash Table
- **Time taken:** 02:19
- [LeetCode Link](https://leetcode.com/problems/two-sum/description/)

## Key Idea

- Use a seen dictionary to track the compliment


## Solution

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Inputs: List[int], target
        # Outputs: List[int]
        # Description:
            # Return indices of the two numbers such that they add up to target

        # Example 1:
            # Inputs: nums = [2,7,11,15], target = 9
            # Outputs: [0,1] -> 2 + 7 = 9
        
        # Setup
        n = len(nums)
        # Seen : 
            # key = complement
            # value = index
        seen = {}

        for i in range(n):
            # Check if it is in seen
            if nums[i] in seen:
                return [seen[nums[i]], i]
            # We first find the "other half"
            complement = target - nums[i]
            seen[complement] = i
            # e.g. For 2, complement = 7, seen[7] = 0
            # e.g. For 7, complement = 2, seen[2] = 1
```

## Complexity

- Time: O(n)
- Space: O(n)

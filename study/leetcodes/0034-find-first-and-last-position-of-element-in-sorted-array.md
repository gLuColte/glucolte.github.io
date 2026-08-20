---
layout: leetcode
title: "Find First and Last Position of Element in Sorted Array"
permalink: /study/leetcodes/0034-find-first-and-last-position-of-element-in-sorted-array
leetcode_id: 34
difficulty: Medium
leetcode_url: https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/description/
primary_pattern: "Arrays & Strings"
topics:
  - "Array"
  - "Binary Search"
date_solved: 2026-08-18
time_taken: "16:28"
language: Python3
---

# Find First and Last Position of Element in Sorted Array

- **Difficulty:** Medium
- **Primary pattern:** Arrays & Strings
- **Tags:** Array, Binary Search
- **Time taken:** 16:28
- [LeetCode Link](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/description/)

## Key Idea

- Index pointers are the key, use left and right
- For this, you need at least 2 loops, and each perform binary search. One for first and the other for last


## Solution

```python
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        # Understanding:
            # array of ints in non decreasing order
            # find starting + ending position of a given target value
        
        # e.g.
            # nums = [5,7,7,8,8,10], target = 10
            # output = [3,4]
        first = -1
        last = -1

        # Find first
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = (left + right) // 2
            if nums[mid] < target:
                left = mid + 1
            elif nums[mid] < target:
                right = mid - 1
            else:
                first = mid
                right = mid - 1
        
        # Find last
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] < target:
                left = mid + 1
            elif nums[mid] > target:
                right = mid - 1
            else:
                last = mid
                left = mid + 1
        return [first, last]
```

## Complexity

- Time: O(log n)
- Space: O(1)

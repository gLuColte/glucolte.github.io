---
layout: leetcode
title: "Search in Rotated Sorted Array"
permalink: /study/leetcodes/0033-search-in-rotated-sorted-array
leetcode_id: 33
difficulty: Medium
leetcode_url: https://leetcode.com/problems/search-in-rotated-sorted-array/description/
primary_pattern: "Arrays & Strings"
topics:
  - "Array"
  - "Binary Search"
date_solved: 2026-08-15
time_taken: "18:00"
language: Python3
---

# Search in Rotated Sorted Array

- **Difficulty:** Medium
- **Primary pattern:** Arrays & Strings
- **Tags:** Array, Binary Search
- **Time taken:** 18:00
- [LeetCode Link](https://leetcode.com/problems/search-in-rotated-sorted-array/description/)

## Key Idea

- Use Pointers, Left and Right
- From there, think about how to move the pointers to close the gap, where the "mid" is your target index


## Solution

```python
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        # Understanding
            # nums in ascending order, with DISTINCT values
            # might be left rotated resulting array not in ascending value
            # You need to find the index of target if it is in nums, else -1
        
        left = 0
        right = len(nums) -1
        
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                # Right half is sorted
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1
        return -1
```

## Complexity

- Time: O(log n)
- Space: O(1)

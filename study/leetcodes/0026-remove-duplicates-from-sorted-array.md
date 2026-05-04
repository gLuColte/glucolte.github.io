---
layout: leetcode
title: "Remove Duplicates from Sorted Array"
permalink: /study/leetcodes/0026-remove-duplicates-from-sorted-array
leetcode_id: 26
difficulty: Easy
leetcode_url: https://leetcode.com/problems/remove-duplicates-from-sorted-array/
primary_pattern: "Arrays & Strings"
topics:
  - "Array"
  - "Two Pointers"
date_solved: 2026-05-04
time_taken: "08:52"
language: Python3
---

# Remove Duplicates from Sorted Array

- **Difficulty:** Easy
- **Primary pattern:** Arrays & Strings
- **Tags:** Array, Two Pointers
- **Time taken:** 08:52
- [LeetCode Link](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)

## Key Idea

- The trick here is to have 2 pointers, one is write the other is read
- You move Read index to check against duplicate, note duplicate is always ordered
- Depending on what you read, you either update write index if it is NOT duplicate or hold if it is


## Solution

```python
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        # Example 1:
        # Input: nums = [1,1,2]
        # Output: 2, nums = [1,2,_]
        # Explanation: Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively.
        # It does not matter what you leave beyond the returned k (hence they are underscores).

        # Example 2:
        # Input: nums = [0,0,1,1,1,2,2,3,3,4]
        # Output: 5, nums = [0,1,2,3,4,_,_,_,_,_]
        # Explanation: Your function should return k = 5, with the first five elements of nums being 0, 1, 2, 3, and 4 respectively.
        # It does not matter what you leave beyond the returned k (hence they are underscores).

        # If no list skip
        if not nums:
            return 0

        # Write index
        write_index = 1
        for read_index in range(1, len(nums)):
            # If it is NOT duplicate
            if nums[read_index] != nums[read_index - 1]:
                # You update in place
                nums[write_index] = nums[read_index]
                write_index += 1

        return write_index
```

## Complexity

- Time: O(n)
- Space: O(1)

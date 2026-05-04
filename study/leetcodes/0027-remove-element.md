---
layout: leetcode
title: "Remove Element"
permalink: /study/leetcodes/0027-remove-element
leetcode_id: 27
difficulty: Unknown
leetcode_url: https://leetcode.com/problems/remove-element/submissions/1994826772/
primary_pattern: "Arrays & Strings"
topics:
  - "Array"
  - "Two Pointers"
date_solved: 2026-05-04
time_taken: "04:50"
language: Python3
---

# Remove Element

- **Difficulty:** Unknown
- **Primary pattern:** Arrays & Strings
- **Tags:** Array, Two Pointers
- **Time taken:** 04:50
- [LeetCode Link](https://leetcode.com/problems/remove-element/submissions/1994826772/)

## Key Idea

- Reader and Writer Index pointer
- You increment the reader index pointer, and only increment writer index if nums[reader_index] != val
- You then return writer index


## Solution

```python
class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        # Inputs: List[int], int
        # Outputs: Int
        # Description
            # Remove all occurence of val in nums - INPLACE order can change
            # Return the number of elements in nums which are not equal to val

        # Example 1:
        # Input: nums = [3,2,2,3], val = 3
        # Output: 2, nums = [2,2,_,_]
        # Explanation: Your function should return k = 2, with the first two elements of nums being 2.
        # It does not matter what you leave beyond the returned k (hence they are underscores).

        # Example 2:
        # Input: nums = [0,1,2,2,3,0,4,2], val = 2
        # Output: 5, nums = [0,1,4,0,3,_,_,_]
        # Explanation: Your function should return k = 5, with the first five elements of nums containing 0, 0, 1, 3, and 4.
        # Note that the five elements can be returned in any order.
        # It does not matter what you leave beyond the returned k (hence they are underscores).

        # Initialize
        writer_index = 0
        for reader_index in range(0,len(nums)):
            # Check if it is the same as val
            if nums[reader_index] == val:
                reader_index += 1
            else:
                nums[writer_index] = nums[reader_index]
                writer_index += 1
            reader_index += 1
        return writer_index
```

## Complexity

- Time: O(n) -> Becuase you have to iterate through N elements
- Space: O(1) -> Because no storage

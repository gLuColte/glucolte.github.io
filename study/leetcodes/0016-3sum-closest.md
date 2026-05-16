---
layout: leetcode
title: "3Sum Closest"
permalink: /study/leetcodes/0016-3sum-closest
leetcode_id: 16
difficulty: Medium
leetcode_url: https://leetcode.com/problems/3sum-closest/submissions/2004181235/
primary_pattern: "Arrays & Strings"
topics:
  - "Array"
  - "Two Pointers"
  - "Sorting"
date_solved: 2026-05-16
time_taken: "22:46"
language: Python3
---

# 3Sum Closest

- **Difficulty:** Unknown
- **Primary pattern:** Arrays & Strings
- **Tags:** Array, Two Pointers, Sorting
- **Time taken:** 22:46
- [LeetCode Link](https://leetcode.com/problems/3sum-closest/submissions/2004181235/)

## Key Idea

- The trick here is thinking using:
```
index:  0  1  2  3  4  5
value:  1  2  3  4  5  6
        i  L           R
```
- you move i, and if the sum is too large, you move R, elif smaller move L, then else return the target if it is equal 


## Solution

```python
class Solution:
    def threeSumClosest(self, nums: List[int], target: int) -> int:
        # inputs: List[int], int
        # outputs: int
        # Description:
            # Given an interger array nums of length n, and an interger, finde 3 itnergers at distinct indicies in nums such that the sums is clsoest to target
            # Output does not care about indices, just the sum
        # initialize
        # Sorted list
        nums.sort()
        # Get initial closest sum
        closest_sum = nums[0] + nums[1] + nums[2]

        # Iterate
        for pointer in range(len(nums) - 2):
            left_pointer = pointer + 1
            right_pointer = len(nums) - 1

            while left_pointer < right_pointer:
                current_sum = nums[pointer] + nums[left_pointer] + nums[right_pointer]
                # Check the difference
                if abs(current_sum - target) < abs(closest_sum - target):
                    closest_sum = current_sum
                # moving pointers
                if current_sum < target:
                    left_pointer += 1
                elif current_sum > target:
                    right_pointer -= 1
                else:
                    # If iti s equal we return it
                    return target
        return closest_sum
```

## Complexity

- Time: O(n2) because for each you run N times
- Space: O(1) because you sorted the list

---
layout: leetcode
title: "Palindrome Number"
permalink: /study/leetcodes/0009-palindrome-number
leetcode_id: 9
difficulty: Easy
leetcode_url: https://leetcode.com/problems/palindrome-number/
primary_pattern: "Math & Bit Manipulation"
topics:
  - "Math"
date_solved: 2026-05-03
time_taken: "08:51"
language: Python3
---

# Palindrome Number

- **Difficulty:** Easy
- **Primary pattern:** Math & Bit Manipulation
- **Tags:** Math
- **Time taken:** 08:51
- [LeetCode Link](https://leetcode.com/problems/palindrome-number/)

## Key Idea

- Using Pointers
- Recommended solution uses 2 points instead of just one, left and right


## Solution

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Inputs: int
        # Outputs: bool
        # Description: if x is palindrome (read same forward/backward), true, if not false

        # Example 
        # Input: 121
        # Output: true
        
        # Example
        # Input: -121
        # Output: False

        # Example 
        # Input: 10
        # Output: false

        # Negative
        if x < 0:
            return False
        
        # Initalize
        str_x = str(x)
        final_index = len(str_x)

        # Iterate
        for index,digit in enumerate(str_x[:round(final_index/2)]):
            if digit != str_x[final_index -1]:
                return False
            # Move final index forward
            final_index -= 1
        return True
```

## Complexity

- Time: O(n/2) -> Big O drops constant, so its O(n)
- Space: O(n) because str(x) create the string

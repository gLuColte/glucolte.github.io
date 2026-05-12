---
layout: leetcode
title: "Reverse Integer"
permalink: /study/leetcodes/0007-reverse-integer
leetcode_id: 7
difficulty: Medium
leetcode_url: https://leetcode.com/problems/reverse-integer/
primary_pattern: "Math & Bit Manipulation"
topics:
  - "Math"
date_solved: 2026-05-12
time_taken: "10:18"
language: Python3
---

# Reverse Integer

- **Difficulty:** Unknown
- **Primary pattern:** Math & Bit Manipulation
- **Tags:** Math
- **Time taken:** 10:18
- [LeetCode Link](https://leetcode.com/problems/reverse-integer/)

## Key Idea

- bin(reversed_x)[2:] -> this gives "1101101" which drops the '0b' in front
- Check either by comparing -2**31 < x < 2**31 OR using bit method to compare bit, which is faster


## Solution

```python
class Solution:
    def reverse(self, x: int) -> int:
        # Inputs: Int
        # Outputs: Int
        # Description: Revrese an integer, if digit goes out of 32 bits return 0
        negative_indicator = False
        if x < 0:
            negative_indicator = True
            x *= -1

        # Reverse first
        reversed_x = int(str(x)[::-1])
        # Positive max is 31 bits
        if not negative_indicator:
            if len(bin(reversed_x)[2:]) > 31:
                return 0
            return reversed_x

        # Negative min can use up to 32 bits in magnitude
        # because -2**31 is allowed
        else:
            if len(bin(reversed_x)[2:]) > 31:
                return 0
            return -1 * reversed_x
```

## Complexity
- Time: O(n) -> n = number of digits
- Space: O(n) -> because [::-1] creates extra string

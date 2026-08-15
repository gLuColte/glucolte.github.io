---
layout: leetcode
title: "Power of Two"
permalink: /study/leetcodes/0231-power-of-two
leetcode_id: 231
difficulty: Easy
leetcode_url: https://leetcode.com/problems/power-of-two/
primary_pattern: "Math & Bit Manipulation"
topics:
  - "Math"
  - "Bit Manipulation"
  - "Recursion"
date_solved: 2026-08-14
time_taken: "07:31"
language: Python3
---

# Power of Two

- **Difficulty:** Easy
- **Primary pattern:** Math & Bit Manipulation
- **Tags:** Math, Bit Manipulation, Recursion
- **Time taken:** 00:31
- [LeetCode Link](https://leetcode.com/problems/power-of-two/)

## Key Idea

- If a number is power of 2, the binary representation should be 1******0 
- e.g. 2 = 10, 2**4 = 10000
- From there, n-1 is 0*****1
- e.g. 1 = 01, (2**4)-1 = 01111
- & is used for bitwise comparision


## Solution

```python
class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        # If you check power of 2, the Binary is actually ending in 0
            # >>> f"{2**1:b}"
            # '10'
            # >>> f"{2**2:b}"
            # '100'
            # >>> f"{2**3:b}"
            # '1000'
            # >>> f"{2**4:b}"
            # '10000'
        # Based on that, we do bit wise comparison
            # & -> Stands for AND for bitwise comparison
            # if n is power of 2, e.g. 10, then n - 1 is 01
            # so the bit wise comparision is 0
        return n > 0 and n & (n-1) == 0
```

## Complexity

- Time: O(1)
- Space: O(1)

---
layout: leetcode
title: "Divide Two Integers"
permalink: /study/leetcodes/0029-divide-two-integers
leetcode_id: 29
difficulty: Medium
leetcode_url: https://leetcode.com/problems/divide-two-integers/
primary_pattern: "Math & Bit Manipulation"
topics:
  - "Math"
  - "Bit Manipulation"
date_solved: 2026-05-21
time_taken: "08:58"
language: Python3
---

# Divide Two Integers

- **Difficulty:** Easy
- **Primary pattern:** Math & Bit Manipulation
- **Tags:** Math, Bit Manipulation
- **Time taken:** 08:58
- [LeetCode Link](https://leetcode.com/problems/divide-two-integers/)

## Key Idea

- Repeated subtraction works, but it is too slow because it subtracts the divisor one time at a time.
- Instead, subtract the largest doubled divisor that still fits inside the remaining dividend.
- `<<= 1` doubles a number using bit shifting.
- When doubling `current_divisor`, also double `current_quotient` so we know how many original divisors we are subtracting at once.
Example:
```text
43 / 3
current_divisor   current_quotient
3                 1
6                 2
12                4
24                8
48                16  too large, stop before this
43 - 24 = 19
quotient += 8

Then repeat:

19 / 3
3                 1
6                 2
12                4
24                8  too large
19 - 12 = 7
quotient += 4

Then repeat:

7 / 3
3                 1
6                 2
12                4  too large
7 - 6 = 1
quotient += 2

Final:

quotient = 8 + 4 + 2 = 14

So:

43 / 3 = 14
```



## Solution

```python
class Solution:
    def divide(self, dividend: int, divisor: int) -> int:
        INT_MIN = -2**31
        INT_MAX = 2**31 - 1

        # Overflow case: LeetCode expects clamp
        if dividend == INT_MIN and divisor == -1:
            return INT_MAX

        negative_output = (dividend < 0) != (divisor < 0)

        dividend = abs(dividend)
        divisor = abs(divisor)

        quotient = 0

        while dividend >= divisor:
            current_divisor = divisor
            current_quotient = 1

            # Keep doubling while it still fits
            while dividend >= (current_divisor << 1):
                current_divisor <<= 1
                current_quotient <<= 1

            dividend -= current_divisor
            quotient += current_quotient

        return -quotient if negative_output else quotient
```

## Complexity

* Time: O(log² n)
    * The outer loop repeatedly subtracts the largest doubled divisor from the dividend.
    * The inner loop finds that largest doubled divisor using repeated doubling.
    * In the worst case, this gives O(log² n).
* Space: O(1)
    * Only a fixed number of variables are used:
        quotient, current_divisor, current_quotient, and sign flags.

Where `n = abs(dividend)`.


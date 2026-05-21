---
layout: leetcode
title: "Add Binary"
permalink: /study/leetcodes/0067-add-binary
leetcode_id: 67
difficulty: Easy
leetcode_url: https://leetcode.com/problems/add-binary/
primary_pattern: "Arrays & Strings"
topics:
  - "Math"
  - "String"
  - "Bit Manipulation"
  - "Simulation"
date_solved: 2026-05-21
time_taken: "05:40"
language: Python3
---

# Add Binary

- **Difficulty:** Easy
- **Primary pattern:** Arrays & Strings
- **Tags:** Math, String, Bit Manipulation, Simulation
- **Time taken:** 05:40
- [LeetCode Link](https://leetcode.com/problems/add-binary/)

## Key Idea

- Iterating backwards using "index"
- Idea on % and // -> % means whole number result from divide and // means remainder
- This is not about converting to binary representation, please read question carefully


## Solution

```python
class Solution:
    def addBinary(self, a: str, b: str) -> str:
        # Initialize i and j = From right of the string
        i = len(a) - 1
        j = len(b) - 1
        carry = 0
        result = []
        # Iterate
        while i >= 0 or j >= 0 or carry:
            total = carry
            # Move i
            if i >= 0:
                total += int(a[i])
                i -= 1
            # Move j
            if j >= 0:
                total += int(b[j])
                j -= 1
            # 1 + 1 becomes 2 -> then you carry over
            result.append(str(total%2))
            carry = total // 2
        return "".join(reversed(result))
```

## Complexity

- Time: O(n)
- Space: O(1)

---
layout: leetcode
title: "Plus One"
permalink: /study/leetcodes/0066-plus-one
leetcode_id: 66
difficulty: Easy
leetcode_url: https://leetcode.com/problems/plus-one/description/
primary_pattern: "Arrays & Strings"
topics:
  - "Array"
  - "Math"
date_solved: 2026-05-21
time_taken: "11:48"
language: Python3
---

# Plus One

- **Difficulty:** Easy
- **Primary pattern:** Arrays & Strings
- **Tags:** Array, Math
- **Time taken:** 11:48
- [LeetCode Link](https://leetcode.com/problems/plus-one/description/)

## Key Idea

- Trick here is knowing how to reverse the range()
- To rever range(5,-1,-1) means from 5 to -1 (not including -1) in reverse order


## Solution

```python
class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        # Inputs: List[int]
        # Outputs: List[int]
        # Description:
            # Increment "digits" by one and return the list
        # E.g. [1,2,3] reutrns [1,2,4]
        
        # Increment last by 1
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0
        return [1] + digits
```

## Complexity

- Time: O(n)
- Space: O(1)

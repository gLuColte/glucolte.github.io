---
layout: leetcode
title: "Roman to Integer"
permalink: /study/leetcodes/0013-roman-to-integer
leetcode_id: 13
difficulty: Easy
leetcode_url: https://leetcode.com/problems/roman-to-integer/
primary_pattern: "Arrays & Strings"
topics:
  - "Hash Table"
  - "Math"
  - "String"
date_solved: 2026-05-03
time_taken: "19:51"
language: Python3
---

# Roman to Integer

- **Difficulty:** Easy
- **Primary pattern:** Arrays & Strings
- **Tags:** Hash Table, Math, String
- **Time taken:** 19:51
- [LeetCode Link](https://leetcode.com/problems/roman-to-integer/)

## Key Idea

- Going from left to right its simple additoin
- Think about how it Subtracts, you need to see the "window"
- Either do that by if statements or check to last index


## Solution

```python
class Solution:
    def romanToInt(self, s: str) -> int:
        output_num = 0

        roman_mapper = {
            "I": 1,
            "V": 5,
            "X": 10,
            "L": 50,
            "C": 100,
            "D": 500,
            "M": 1000
        }

        last_num_roman = None

        for num_roman in s:
            output_num += roman_mapper[num_roman]

            if (
                (last_num_roman == "C" and num_roman in ["M", "D"]) or
                (last_num_roman == "X" and num_roman in ["L", "C"]) or
                (last_num_roman == "I" and num_roman in ["V", "X"])
            ):
                output_num -= 2 * roman_mapper[last_num_roman]

            last_num_roman = num_roman

        return output_num
```

## Complexity

- Time: O(n)
- Space: O(1) 

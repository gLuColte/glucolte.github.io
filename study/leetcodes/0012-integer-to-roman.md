---
layout: leetcode
title: "Integer to Roman"
permalink: /study/leetcodes/0012-integer-to-roman
leetcode_id: 12
difficulty: Medium
leetcode_url: https://leetcode.com/problems/integer-to-roman/submissions/2003406951/
primary_pattern: "Arrays & Strings"
topics:
  - "Hash Table"
  - "Math"
  - "String"
date_solved: 2026-05-15
time_taken: "23:09"
language: Python3
---

# Integer to Roman

- **Difficulty:** Unknown
- **Primary pattern:** Arrays & Strings
- **Tags:** Hash Table, Math, String
- **Time taken:** 23:09
- [LeetCode Link](https://leetcode.com/problems/integer-to-roman/submissions/2003406951/)

## Key Idea

- Understand the pattern of Subractive and Addititve mode
- Convert string to list and pop


## Solution

```python
class Solution:
    def intToRoman(self, num: int) -> str:
        # Input: num
        # Output: str
        # Integer to Roman
            # if value start with 4 or 9 -> Subractive form
            # if not -> maximal value
            # only powers of 10 can be appeneded consecutively at most 3 times
            # You can not append 5/50 or 500 multiple times, if you need to append 4 times use subtractive form
        # Min 1 Max 3999

        # Initialize
        output_str = ""
        list_num = list(str(num))
        current_size = len(list_num)
        while list_num:
            leftmost_digit = int(list_num.pop(0))
            # Subractive -> Add to the Left
            if leftmost_digit == 4:
                # Hundreds
                if current_size == 3:
                    output_str += "CD" 
                # Tens
                elif current_size == 2:
                    output_str += "XL"
                # Single
                else:
                    output_str += "IV"
            elif leftmost_digit == 9:
                # Hundreds
                if current_size == 3:
                    output_str += "CM" 
                # Tens
                elif current_size == 2:
                    output_str += "XC"
                # Single
                else:
                    output_str += "IX"
            # Addititive -> Add to the Right
            else:
                # Thousands
                if current_size == 4:
                    output_str += "M" * leftmost_digit
                # Hundreds
                elif current_size == 3:
                    if leftmost_digit >= 5:
                        output_str += "D"
                        leftmost_digit -= 5
                    output_str += "C" * leftmost_digit
                # Tens
                elif current_size == 2:
                    if leftmost_digit >= 5:
                        output_str += "L"
                        leftmost_digit -= 5
                    output_str += "X" * leftmost_digit
                # Single
                else:
                    if leftmost_digit >= 5:
                        output_str += "V"
                        leftmost_digit -= 5
                    output_str += "I" * leftmost_digit
            current_size = len(list_num)
        return output_str
```

## Complexity

- Time: O(n2)
- Space: O(n)

---
layout: leetcode
title: "Zigzag Conversion"
permalink: /study/leetcodes/0006-zigzag-conversion
leetcode_id: 6
difficulty: Medium
leetcode_url: https://leetcode.com/problems/zigzag-conversion/submissions/2001373032/
primary_pattern: "Arrays & Strings"
topics:
  - "String"
date_solved: 2026-05-12
time_taken: "03:39"
language: Python3
---

# Zigzag Conversion

- **Difficulty:** Unknown
- **Primary pattern:** Arrays & Strings
- **Tags:** String
- **Time taken:** 03:39
- [LeetCode Link](https://leetcode.com/problems/zigzag-conversion/submissions/2001373032/)

## Key Idea

- The key here is to think using "directions" (1 going down, -1 going up)
- Using a list of strings to represent rows then going upward or downards


## Solution

```python
class Solution:
    def convert(self, s: str, numRows: int) -> str:
        # Inputs: s, numRows
        # Output: str
        # Example
            # Inputs: s = "PAYPALISHIRING", numRows = 3
            # Output: "PAHNAPLSIIGYIR"
        
        # Example 2:
            # Input: s = "PAYPALISHIRING", numRows = 4
            # Output: "PINALSIGYAHRPI"
            # Explanation:
            # P     I    N
            # A   L S  I G
            # Y A   H R
            # P     I
        # Example 3:
            # Input: s = "A", numRows = 1
            # Output: "A"

        # Edge Case
        if numRows == 1:
            return s
        
        # Initialize
        rows = [""] * numRows

        current_row = 0
        direction = 1

        for character in s:
            rows[current_row] += character
            if current_row == 0 :
                direction = 1
            elif current_row == numRows - 1:
                direction = -1
            
            # Move 
            current_row += direction
        # Join all
        return "".join(rows)
```

## Complexity

- Time: O(n)
- Space: O(n)

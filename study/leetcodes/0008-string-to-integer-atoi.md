---
layout: leetcode
title: "String to Integer (atoi)"
permalink: /study/leetcodes/0008-string-to-integer-atoi
leetcode_id: 8
difficulty: Medium
leetcode_url: https://leetcode.com/problems/string-to-integer-atoi/
primary_pattern: "Arrays & Strings"
topics:
  - "String"
date_solved: 2026-05-12
time_taken: "08:22"
language: Python3
---

# String to Integer (atoi)

- **Difficulty:** Unknown
- **Primary pattern:** Arrays & Strings
- **Tags:** String
- **Time taken:** 08:22
- [LeetCode Link](https://leetcode.com/problems/string-to-integer-atoi/)

## Key Idea

- len(bin(x)[2:]) returns bits count. and 31 is the largest
- Understanding how flags work
   - Have you seen a +/- sign yet?
- Returning the rounded value if length exceeds 


## Solution

```python
class Solution:
    def myAtoi(self, s: str) -> int:
        # inputs: string
        # Outputs: integer
        # Description:
            # Covnerts a string to 32 bit signed integer
            # Ignores leading white spaces
            # Signedness -> check - or +, assume positive
            # Conversion -> Read the integer by skipping leading zeros until a non digit is encountered or end of string. If no digits were read, then result is 0
            # Rouding: if the integer is out of the 32 bit singed integer range, then round to remaining 

        # Initialize
        negative_indicator = False
        # Have I already seen a + or - sign?
        sign_seen = False
        output_result = ""
        for character in s:
            if character.isdigit():
                output_result += character
            elif character == "-" and output_result == "" and not sign_seen:
                negative_indicator = True
                sign_seen = True
            elif character == "+" and output_result == "" and not sign_seen:
                negative_indicator = False
                sign_seen = True
            elif character == " " and output_result == "" and not sign_seen:
                continue
            else:
                break

        # edge case
        if output_result == "":
            return 0
        
        # Check if it is in the range
        num = int(output_result)
        bit_len = len(bin(num)[2:])
        if negative_indicator:
            # Negative can go to -2^31
            if bit_len > 32:
                return -(1 << 31)
            # If it is 32 bits, only 1000...000 is valid
            if bit_len == 32 and bin(num)[2:] != "1" + "0" * 31:
                return -(1 << 31)
            # Else
            return -1 * num
        else:
            # Positive can only go to 2^31 - 1
            if bit_len > 31:
                return (1 << 31) - 1
            # Else
            return num
```

## Complexity

- Time: O(n)
- Space: O(n)

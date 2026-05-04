---
layout: leetcode
title: "Valid Parentheses"
permalink: /study/leetcodes/0020-valid-parentheses
leetcode_id: 20
difficulty: Unknown
leetcode_url: https://leetcode.com/problems/valid-parentheses/submissions/1994606873/
primary_pattern: "Design Problems"
topics:
  - "String"
  - "Stack"
date_solved: 2026-05-04
time_taken: "15:32"
language: Python3
---

# Valid Parentheses

- **Difficulty:** Unknown
- **Primary pattern:** Design Problems
- **Tags:** String, Stack
- **Time taken:** 15:32
- [LeetCode Link](https://leetcode.com/problems/valid-parentheses/submissions/1994606873/)

## Key Idea

- understand how stack.pop() works as LIFO
- Beacuse it is LIFO, you are able to match while iterate through


## Solution

```python
class Solution:
    def isValid(self, s: str) -> bool:
        # Inputs: str
        # Outputs: bool
        # Description:
            # brackets must be closed by same type
            # brackets closed in correct order
            # every close brack has a corresponding open bracket
        
        # Example
            # Input "()"
            # Output true
        # Example 
            # Input "()[]{}"
            # Output true
        # Example 
            # Input "{]"
            # Output False
        # Example
            # Input "([])"
            # Output True
        # Example
            # Input "([)]" -> this is false, so it has to "follow"
            # Output False
        # Constratins -> Only 3 kinds of bracket
            # (,),{,},[,]
            # Can possibily repeat

        # If it is odd number, its not
        len_str = len(s)
        if len_str % 2 != 0:
            return False
        # Initialize
        stack = []
        bracket_map ={
            ")": "(",
            "]": "[",
            "}": "{"            
        }
        # Iterate through the string
        for char in s:
            # If it is a open bracket, append it to stack
            if char in ["(", "[", "{"]:
                stack.append(char)
            # If it is NOT
            else:
                # Check if there is still an "open" bracket
                if not stack:
                    return False
                # If there is, LiFO, get it
                last_open_bracket = stack.pop()
                # Check if it is the correct
                if last_open_bracket != bracket_map[char]:
                    return False
        return len(stack) == 0
```

## Complexity

- Time:
- Space:

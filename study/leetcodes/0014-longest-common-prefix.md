---
layout: leetcode
title: "Longest Common Prefix"
permalink: /study/leetcodes/0014-longest-common-prefix
leetcode_id: 14
difficulty: Unknown
leetcode_url: https://leetcode.com/problems/longest-common-prefix/
primary_pattern: "Trees"
topics:
  - "Array"
  - "String"
  - "Trie"
date_solved: 2026-05-04
time_taken: "17:02"
language: Python3
---

# Longest Common Prefix

- **Difficulty:** Unknown
- **Primary pattern:** Trees
- **Tags:** Array, String, Trie
- **Time taken:** 17:02
- [LeetCode Link](https://leetcode.com/problems/longest-common-prefix/)

## Key Idea

- Key here is to "parallel" check each index during iteration

## Solution

```python
class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        # Inputs: List[str]
        # Output: str
        # Descpriont:
            # longest common prefix
        # Example:
            # Inputs: ["flower", "flow", "flight"]
            # Output: "fl"
        # Example:
            # Inputs: ["dog", "racecar", "car"]
            # Output: ""
        
        # Initialize
        prefix_runner = ""
        shortest_str = min(strs, key=len)
        # Iterate through shortest string
        for index in range(len(shortest_str)):
            # Create an indicator for while loop
            indicator = True
            # For each str, check if for same index they are the same character
            for comparing_str in strs:
                if comparing_str[index] != shortest_str[index]:
                    # If not set indicator to false
                    indicator = False
            # Check indicator
            if indicator:
                prefix_runner += shortest_str[index]
            else:
                return prefix_runner
        # If all str are the same comparing to prefix
        return prefix_runner
```

## Complexity

- Time: O(m*n) -> you are iterating through the shortest Element, O removes constants
- Space: O(m) -> you are storing the shortest string, you can reduce by `return shortest_str[:index]`

- m is the length of shortest string
- n is the number of strings

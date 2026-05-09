---
layout: leetcode
title: "Longest Substring Without Repeating Characters"
permalink: /study/leetcodes/0003-longest-substring-without-repeating-characters
leetcode_id: 3
difficulty: Medium
leetcode_url: https://leetcode.com/problems/longest-substring-without-repeating-characters/description/
primary_pattern: "Arrays & Strings"
topics:
  - "Hash Table"
  - "String"
  - "Sliding Window"
date_solved: 2026-05-07
time_taken: "17:46"
language: Python3
---

# Longest Substring Without Repeating Characters

- **Difficulty:** Medium
- **Primary pattern:** Arrays & Strings
- **Tags:** Hash Table, String, Sliding Window
- **Time taken:** 17:46
- [LeetCode Link](https://leetcode.com/problems/longest-substring-without-repeating-characters/description/)

## Key Idea

- Resetting the seen list AFTER seeing a duplicate, reset does not mean to 0, is to the current next


## Solution

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Inputs: str
        # Outputs: int
        # Description:
            # Longest substring without duplicate
        
        # Example
            # Input: s = "abcabcbb"
            # Output: 3, "abc" -> "bca" and "cab" are also correct
        # Example
            # input: s = "bbbbbb"
            # Output: 1,
        # Example
            # input: s = "pwwkew"
            # Output: 3m

        # Initialize
        seen = ""
        runner = 0
        # Iterate
        for character in s:
            # If it is not in the string
            if character not in seen:
                # Append
                seen += character
            # If it is, we running into duplicate
            else:
                # Runner is maximum of the 2
                runner = max(runner, len(seen))
                # Reset seen to the substring after the previous duplicate,
                # then add the current character
                seen = seen[seen.index(character) + 1:] + character
        return max(runner, len(seen))
```

## Complexity

- Time:  O(n^2)
- Space: O(n)

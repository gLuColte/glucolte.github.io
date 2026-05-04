---
layout: leetcode
title: "Find the Index of the First Occurrence in a String"
permalink: /study/leetcodes/0028-find-the-index-of-the-first-occurrence-in-a-string
leetcode_id: 28
difficulty: Unknown
leetcode_url: https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/submissions/1994837192/
primary_pattern: "Arrays & Strings"
topics:
  - "Two Pointers"
  - "String"
  - "String Matching"
date_solved: 2026-05-04
time_taken: "19:03"
language: Python3
---

# Find the Index of the First Occurrence in a String

- **Difficulty:** Unknown
- **Primary pattern:** Arrays & Strings
- **Tags:** Two Pointers, String, String Matching
- **Time taken:** 19:03
- [LeetCode Link](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/submissions/1994837192/)

## Key Idea

- Understand how needle and haystack pointers work
- haystack pointer need to "go back" to capture "needle", so mississippi and issip
   - because is you use simple 2 pointers, this fails, as it doesnt go back 


## Solution

```python
class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        # Inputs: Haystack str, needle str
        # Output: int
        # Description:
            # index of first occurence of needle in haystack or -1 is not

        # Example 1:
        # Input: haystack = "sadbutsad", needle = "sad"
        # Output: 0
        # Explanation: "sad" occurs at index 0 and 6.
        # The first occurrence is at index 0, so we return 0.

        # Example 2:
        # Input: haystack = "leetcode", needle = "leeto"
        # Output: -1
        # Explanation: "leeto" did not occur in "leetcode", so we return -1.

        # Length of needle
        length_needle = len(needle)

        # Iterate through every possible starting index in haystack
        # We only go up to len(haystack) - len(needle)
        # because after that, there are not enough characters left to match needle
        for start_index in range(len(haystack) - length_needle + 1):

            # Pointer for checking each character in needle
            needle_pointer = 0

            # Try to match the whole needle starting from start_index
            while needle_pointer < length_needle:
                # Compare:
                # haystack character at current shifted position
                # vs
                # needle character at current needle_pointer
                if haystack[start_index + needle_pointer] != needle[needle_pointer]:
                    # If one character does not match,
                    # this start_index is not valid
                    break
                # If character matches, move to next character in needle
                needle_pointer += 1

            # If needle_pointer reached length_needle,
            # it means every character in needle matched
            if needle_pointer == length_needle:
                return start_index

        # If no starting index worked, needle is not found
        return -1
```

## Complexity

- Time: O(m*n)
- Space: O(1)

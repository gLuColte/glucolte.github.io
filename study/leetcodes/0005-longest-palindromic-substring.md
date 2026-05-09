---
layout: leetcode
title: "Longest Palindromic Substring"
permalink: /study/leetcodes/0005-longest-palindromic-substring
leetcode_id: 5
difficulty: Medium
leetcode_url: https://leetcode.com/problems/longest-palindromic-substring/submissions/1998477093/
primary_pattern: "Dynamic Programming"
topics:
  - "Two Pointers"
  - "String"
  - "Dynamic Programming"
date_solved: 2026-05-09
time_taken: "00:01"
language: Python3
---

# Longest Palindromic Substring

- **Difficulty:** Unknown
- **Primary pattern:** Dynamic Programming
- **Tags:** Two Pointers, String, Dynamic Programming
- **Time taken:** 00:01
- [LeetCode Link](https://leetcode.com/problems/longest-palindromic-substring/submissions/1998477093/)

## Key Idea

- Understand that you don't know if it is odd or even palindrome at the start
- Using Pointers for Left and Right, and iterate
- For Even Palindrome, your "right" is +1


## Solution

```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        # If the string is empty or has one character,
        # it is already the longest palindrome
        if len(s) <= 1:
            return s

        # Store the longest palindrome found so far
        max_palindromic = ""

        # Try every character as a possible center
        for current_pointer, character in enumerate(s):

            # ==================================================
            # Odd case
            # Example: "bab"
            #
            # The center is one character:
            # b a b
            #   ^
            #
            # So both pointers start at the same index
            # ==================================================
            left_pointer = current_pointer
            right_pointer = current_pointer

            # Expand while left and right are inside the string
            while left_pointer >= 0 and right_pointer < len(s):

                # If both sides match, we found a palindrome
                if s[left_pointer] == s[right_pointer]:

                    # Save the current palindrome substring
                    current_palindromic = s[left_pointer:right_pointer + 1]

                    # Expand outward
                    left_pointer -= 1
                    right_pointer += 1

                # If they do not match, stop expanding
                else:
                    break

            # Update answer if this odd palindrome is longer
            if len(current_palindromic) > len(max_palindromic):
                max_palindromic = current_palindromic

            # ==================================================
            # Even case
            # Example: "bb"
            #
            # The center is between two characters:
            # b b
            # ^ ^
            #
            # So left starts at current index,
            # right starts at the next index
            # ==================================================
            left_pointer = current_pointer
            right_pointer = current_pointer + 1

            # Important:
            # reset current_palindromic for the even case
            current_palindromic = ""

            # Expand while left and right are inside the string
            while left_pointer >= 0 and right_pointer < len(s):

                # If both sides match, we found a palindrome
                if s[left_pointer] == s[right_pointer]:

                    # Save the current palindrome substring
                    current_palindromic = s[left_pointer:right_pointer + 1]

                    # Expand outward
                    left_pointer -= 1
                    right_pointer += 1

                # If they do not match, stop expanding
                else:
                    break

            # Update answer if this even palindrome is longer
            if len(current_palindromic) > len(max_palindromic):
                max_palindromic = current_palindromic

        return max_palindromic
```

## Complexity

- Time: O(n2) -> Beacuse for each character you expand
- Space: O(1)

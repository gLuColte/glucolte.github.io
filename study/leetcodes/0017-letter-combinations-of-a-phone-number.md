---
layout: leetcode
title: "Letter Combinations of a Phone Number"
permalink: /study/leetcodes/0017-letter-combinations-of-a-phone-number
leetcode_id: 17
difficulty: Medium
leetcode_url: https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/
primary_pattern: "Backtracking"
topics:
  - "Hash Table"
  - "String"
  - "Backtracking"
date_solved: 2026-05-21
time_taken: "15:49"
language: Python3
---

# Letter Combinations of a Phone Number

- **Difficulty:** Medium
- **Primary pattern:** Backtracking
- **Tags:** Hash Table, String, Backtracking
- **Time taken:** 15:49
- [LeetCode Link](https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/)

## Key Idea

- Trick here is to use Pointers
- Refresh the list when you are "adding"
- The other way is to use recursion:
```
class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []

        mapping = {
            "2": "abc",
            "3": "def",
            "4": "ghi",
            "5": "jkl",
            "6": "mno",
            "7": "pqrs",
            "8": "tuv",
            "9": "wxyz",
        }

        result = []

        def backtrack(index: int, path: str):
            if index == len(digits):
                result.append(path)
                return

            for char in mapping[digits[index]]:
                backtrack(index + 1, path + char)

        backtrack(0, "")
        return result
```
- This use the mindset:
```
""
└── choose a
    └── choose d -> "ad"
    └── choose e -> "ae"
    └── choose f -> "af"
└── choose b
    └── choose d -> "bd"
    └── choose e -> "be"
    └── choose f -> "bf"
└── choose c
    └── choose d -> "cd"
    └── choose e -> "ce"
    └── choose f -> "cf"
```


## Solution

```python
class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        # Inputs: str
        # Outputs: List[str]
        # Description:
            # Given string of combination 2-9, find possible combination formed
            # Size of string is output size, e.g. "23" = List[ List[2].. ]
        # Initialize
        number_mapping = {
            "1": "",
            "2": "abc",
            "3": "def",
            "4": "ghi",
            "5": "jkl",
            "6": "mno",
            "7": "pqrs",
            "8": "tuv",
            "9": "wxyz"
        }
        output_list = []
        input_index_pointer = 0

        # Iterate
        while input_index_pointer < len(digits):
            if input_index_pointer == 0:
                for character in number_mapping[digits[input_index_pointer]]:
                    output_list.append(character)
            else:
                output_index_pointer = 0
                new_output_list = []
                while output_index_pointer < len(output_list):
                    for character in number_mapping[digits[input_index_pointer]]:
                        new_output_list.append(output_list[output_index_pointer] + character)
                    output_index_pointer += 1
                output_list = new_output_list
            input_index_pointer += 1
        return output_list
```

## Complexity

- Time is O(n × 4^n) because there are up to 4^n combinations and each string has length n.
- Space is O(n × 4^n) because you store all combinations, each of length n.

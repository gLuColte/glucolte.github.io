---
layout: leetcode
title: "Generate Parentheses"
permalink: /study/leetcodes/0022-generate-parentheses
leetcode_id: 22
difficulty: Medium
leetcode_url: https://leetcode.com/problems/generate-parentheses/
primary_pattern: "Dynamic Programming"
topics:
  - "String"
  - "Dynamic Programming"
  - "Backtracking"
date_solved: 2026-05-16
time_taken: "14:14"
language: Python3
---

# Generate Parentheses

- **Difficulty:** Medium
- **Primary pattern:** Dynamic Programming
- **Tags:** String, Dynamic Programming, Backtracking
- **Time taken:** 14:14
- [LeetCode Link](https://leetcode.com/problems/generate-parentheses/)

## Key Idea

- Need GPT to help
- Recursion explores one valid path until it finishes, then returns to the last choice point and continues exploring the other possible path.
- Try "(" first, finish that whole branch, then come back and try ")" if it is allowed.
- Recursion "unwraps" like a tree 
```
backtrack("", 0, 0)
└── backtrack("(", 1, 0)
    ├── backtrack("((", 2, 0)
    │   ├── backtrack("(((", 3, 0)
    │   │   └── backtrack("((()", 3, 1)
    │   │       └── backtrack("((())", 3, 2)
    │   │           └── backtrack("((()))", 3, 3)
    │   │               └── append "((()))"
    │   │
    │   └── backtrack("(()", 2, 1)
    │       ├── backtrack("(()(", 3, 1)
    │       │   └── backtrack("(()()", 3, 2)
    │       │       └── backtrack("(()())", 3, 3)
    │       │           └── append "(()())"
    │       │
    │       └── backtrack("(())", 2, 2)
    │           └── backtrack("(())(", 3, 2)
    │               └── backtrack("(())()", 3, 3)
    │                   └── append "(())()"
    │
    └── backtrack("()", 1, 1)
        └── backtrack("()(", 2, 1)
            ├── backtrack("()((", 3, 1)
            │   └── backtrack("()(()", 3, 2)
            │       └── backtrack("()(())", 3, 3)
            │           └── append "()(())"
            │
            └── backtrack("()()", 2, 2)
                └── backtrack("()()(", 3, 2)
                    └── backtrack("()()()", 3, 3)
                        └── append "()()()"
```


## Solution

```python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        output_list = []

        def backtrack(current_string, open_count, close_count):
            # Stop when the string has length 2n
            if len(current_string) == 2 * n:
                output_list.append(current_string)
                return

            # Add "(" if we still have opening brackets left
            if open_count < n:
                backtrack(
                    current_string + "(",
                    open_count + 1,
                    close_count
                )

            # Add ")" only if it will not break validity
            if close_count < open_count:
                backtrack(
                    current_string + ")",
                    open_count,
                    close_count + 1
                )

        backtrack("", 0, 0)

        return output_list
```

## Complexity

- Time: O(4^n / √n)
- Space: O(n)

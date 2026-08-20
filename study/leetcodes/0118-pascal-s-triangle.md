---
layout: leetcode
title: "Pascal's Triangle"
permalink: /study/leetcodes/0118-pascal-s-triangle
leetcode_id: 118
difficulty: Easy
leetcode_url: https://leetcode.com/problems/pascals-triangle/description/
primary_pattern: "Dynamic Programming"
topics:
  - "Array"
  - "Dynamic Programming"
date_solved: 2026-08-18
time_taken: "20:00"
language: Python3
---

# Pascal's Triangle

- **Difficulty:** Easy
- **Primary pattern:** Dynamic Programming
- **Tags:** Array, Dynamic Programming
- **Time taken:** 20:00
- [LeetCode Link](https://leetcode.com/problems/pascals-triangle/description/)

## Key Idea

- Think using Indices, indices of output list and indicies of current list
- When iterating, you need to conceptually understand how the numbers are added


## Solution

```python
class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        # Understanding:
            # Input numRows = 5
            # Output [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
        # For each of the rows you iterate and generate
        output = [[1]]
        # Iterate the "rows"
        for i in range(1, numRows):
            # Set previous array
            previous = output[i-1]
            # Start current array
            current = [1]
            # Iterate index of current array
            for j in range(1, len(previous)):
                # Add the number
                current.append(previous[j-1] + previous[j])
            current.append(1)
            output.append(current)
        return output
```

## Complexity

- Time: O(numRows2)
- Space: O(numRows2)

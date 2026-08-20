---
layout: leetcode
title: "Pascal's Triangle II"
permalink: /study/leetcodes/0119-pascal-s-triangle-ii
leetcode_id: 119
difficulty: Easy
leetcode_url: https://leetcode.com/problems/pascals-triangle-ii/
primary_pattern: "Dynamic Programming"
topics:
  - "Array"
  - "Dynamic Programming"
date_solved: 2026-08-18
time_taken: "10:32"
language: Python3
---

# Pascal's Triangle II

- **Difficulty:** Easy
- **Primary pattern:** Dynamic Programming
- **Tags:** Array, Dynamic Programming
- **Time taken:** 10:32
- [LeetCode Link](https://leetcode.com/problems/pascals-triangle-ii/)

## Key Idea

- Trick is know how to kee the "moving" two lists
   - Current VS Previous
   - Set Previous to become Current in the start of next iteration
   - Restart iterating the Current from index 1, then build the number


## Solution

```python
class Solution:
    def getRow(self, rowIndex: int) -> List[int]:
        # Understanding
            # return the row based on pascal triangle
        
        # Set Current
        current = [1]
        # Iterate
            # If rowIndex = 0, range(1,1) > nothing
            # if rowIndex = 1, range (1,2) > iterate 1
        for i in range(1, rowIndex+1):
            previous = current
            current = [1]
            # Index of Previous Row
                # if i = 1, range(1,1) > Nothing
                # if i = 2, range(1,2) > iterate
            for j in range(1,len(previous)):
                # add
                current.append(previous[j-1] + previous[j])
            current.append(1)
        return current
```

## Complexity

- Time: O(rowIndex2)
- Space: O(rowIndex)

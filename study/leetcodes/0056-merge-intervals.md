---
layout: leetcode
title: "Merge Intervals"
permalink: /study/leetcodes/0056-merge-intervals
leetcode_id: 56
difficulty: Easy
leetcode_url: https://leetcode.com/problems/merge-intervals/submissions/2113879296/
primary_pattern: "Arrays & Strings"
topics:
  - "Array"
  - "Sorting"
  - "Quicksort"
date_solved: 2026-08-20
time_taken: "05:24"
language: Python3
---

# Merge Intervals

- **Difficulty:** Easy
- **Primary pattern:** Arrays & Strings
- **Tags:** Array, Sorting, Quicksort
- **Time taken:** 05:24
- [LeetCode Link](https://leetcode.com/problems/merge-intervals/submissions/2113879296/)

## Key Idea

- Sorting the list of lists first based on start
- Use sorted list to confirm and check, if greater then we add to output list, if not it is consider same


## Solution

```python
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        # Understanding:
            # Merge overlapping intervals
            # Array of Start,end
        
        # Sorting based on start
        intervals.sort(key=lambda x: x[0])

        merged = []
        for start, end in intervals:
            # If merged is empty OR start is greater than last end
            # You create new entry
            if not merged or start > merged[-1][1]:
                merged.append([start,end])
            else:
                # else it is keep checking
                merged[-1][1] = max(merged[-1][1], end)
        return merged
```

## Complexity

- Time: O(n logn)
- Space: O(n)

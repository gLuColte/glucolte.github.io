---
layout: leetcode
title: "Climbing Stairs"
permalink: /study/leetcodes/0070-climbing-stairs
leetcode_id: 70
difficulty: Easy
leetcode_url: https://leetcode.com/problems/climbing-stairs/
primary_pattern: "Dynamic Programming"
topics:
  - "Math"
  - "Dynamic Programming"
  - "Memoization"
date_solved: 2026-08-18
time_taken: "14:29"
language: Python3
---

# Climbing Stairs

- **Difficulty:** Easy
- **Primary pattern:** Dynamic Programming
- **Tags:** Math, Dynamic Programming, Memoization
- **Time taken:** 14:29
- [LeetCode Link](https://leetcode.com/problems/climbing-stairs/)

## Key Idea

- Initialize Step 1 and Step 2, and from there build Step 3 onwards
- Constantly updating the variable is the key to dynamic programming


## Solution

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        # Understanding:
            # Given a number n
            # How many arrangmenet of 1 and 2, array you can organize to form n
        # If n is less or equal to 2 steps
        if n <= 2:
            return n
        # Initialize 
        # if n is greater then let's iterate from n=3
        # at Step 3, two steps below is 1, there is only 1 way to reach 1
        ways_to_reach_two_steps_below = 1
        # at Step 3, 1 step below is 2, there is 2 ways to reach 2: 1+1 OR 2
        ways_to_reach_one_step_below = 2
        # Iterate from step 3
        for i in range(3,n+1):
            # Step 3 is the sum of Step 2 + 1
            current = ways_to_reach_two_steps_below + ways_to_reach_one_step_below

            # Preparing for next iteration:
            # Now 1 step below is consider two step
            ways_to_reach_two_steps_below = ways_to_reach_one_step_below
            # Now current step is the 1 step below
            ways_to_reach_one_step_below = current
        # we only return the step below as, we iterate till n+1
        return ways_to_reach_one_step_below
```

## Complexity

- Time: O(n)
- Space: O(1)

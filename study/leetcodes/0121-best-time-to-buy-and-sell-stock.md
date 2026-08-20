---
layout: leetcode
title: "Best Time to Buy and Sell Stock"
permalink: /study/leetcodes/0121-best-time-to-buy-and-sell-stock
leetcode_id: 121
difficulty: Easy
leetcode_url: https://leetcode.com/problems/best-time-to-buy-and-sell-stock/
primary_pattern: "Dynamic Programming"
topics:
  - "Array"
  - "Dynamic Programming"
date_solved: 2026-08-18
time_taken: "09:09"
language: Python3
---

# Best Time to Buy and Sell Stock

- **Difficulty:** Easy
- **Primary pattern:** Dynamic Programming
- **Tags:** Array, Dynamic Programming
- **Time taken:** 09:09
- [LeetCode Link](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)

## Key Idea

- You can only move forward
- You do NOT need to report indices 
- You are finding the best "difference" between the values you read
- For every possible selling day, what is the cheapest price I could have bought at BEFORE today?


## Solution

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # Understanding:
            # Iterate and find maximal difference
            # Array is irregular
            # You can only go forward, meaning you have to finding earnings forward
            # Read the question carefully you do NOT need to report the index, only MAXIMIZED earning
        # Track lowest prices so far
        lowest = prices[0]
        # Earnings
        earnings = 0

        # Iterate
        for price in prices:
            # If the current price beats the lowest you saw
            if price < lowest:
                # Update the lowest price
                lowest = price
            # If current price does NOT beat
            else:
                # find the maximum earnings comparing to previous earnings
                earnings = max(earnings, price - lowest)
        return earnings
```

## Complexity

- Time: O(n)
- Space: O(1)

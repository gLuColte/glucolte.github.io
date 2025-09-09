---
title: heaps and priority queues
permalink: /study/codingHeaps
---

# Heaps & Priority Queues

**Patterns to know:**  
- Kth Largest / Smallest Element.  
- Merge K Sorted Lists.  
- Top-K Frequent Elements.  
- Sliding Window Maximum.  

**How to identify:**  
- Problem about "kth largest/smallest".  
- Need to repeatedly extract min/max quickly.  
- Merging sorted streams.  


## 1. Largest Number after Digit Swaps by Parity - Easy

[Leetcode Link](https://leetcode.com/problems/largest-number-after-digit-swaps-by-parity/description/)


```python

class Solution:
    def largestInteger(self, num: int) -> int:
        # Inputs: int
        # Outputs: int
        # Description:
            # Given an Integer
            # swap out any 2 digit of same parity, e.g. odd swap odd, even swap even

        # Example 1:
        # Inputs: 1234
        # Outputs: 3214
            # Swap 3 with 1 = 3214
        
        # Example 2:
        # Inputs: 65875
        # Outputs: 87655
            # Swap 8 with 6 = 85675
            # Swap 5 with 7 = 87655

        # Setup
        digits = list(str(num))

        # Split to odd and evens
        odds = sorted([int(d) for d in digits if int(d) % 2 ==1], reverse=True)
        evens = sorted([int(d) for d in digits if int(d) % 2 ==0], reverse=True)

        # Pointers for "each" list
        oi, ei = 0,0
        result = []

        # We itereat over the original digits
        for d in digits:
            d = int(d)
            # If odd, use odd list 
            if d % 2 == 1:
                result.append(str(odds[oi]))
                oi += 1
            # If even, use even list
            else:
                result.append(str(evens[ei]))
                ei += 1
        # Join back 
        return int("".join(result))
                

```
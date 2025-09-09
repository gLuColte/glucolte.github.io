---
title: math and bit manipulation
permalink: /study/codingMathBits
---

# Math & Bit Manipulation

**Patterns to know:**  
- GCD / LCM.  
- Modular Arithmetic.  
- Fast Exponentiation.  
- Bitmask DP.  
- XOR tricks (Single Number).  

**How to identify:**  
- Involves divisibility, prime, modulo.  
- Input constraints very large (10^9) → need log-time math.  
- "Subsets" and n ≤ 20 → bitmask.  

## 1. Sum of All Subset XOR Totals - Easy

[Leetcode Link](https://leetcode.com/problems/sum-of-all-subset-xor-totals/)


```python
class Solution:
    def subsetXORSum(self, nums: List[int]) -> int:
        # Inputs: List[int]
        # Outputs: int
        # Description:
            # Find all combinations of a given list
            # Perform "^" XOR and convert back to int
            # e.g. 5^6 = 3
            # Sum all combinations output
        # Setup
        n = len(nums)
        total_sum = 0
        # Using Binary to "represent"
        # e.g. if n = 3, i = 000, 001,010, 011....etc
        for i in range(1<<n):
            current_sum = 0
            # j represents the index of nums
            for j in range(n):
                if i & (1<<j):
                    current_sum ^= nums[j]
            total_sum += current_sum
        return total_sum
        # Complexity
        # O(n 2^n)
        # O(1)cioj
```

## 2. Convert integer to the Sum of Two No-Zero Integers - Easy

[Leetcode Link](https://leetcode.com/problems/convert-integer-to-the-sum-of-two-no-zero-integers/description/?envType=daily-question&envId=2025-09-08)

```python
class Solution:
    def getNoZeroIntegers(self, n: int) -> List[int]:
        # Inputs: int
        # Outputs: List[int]
        # Description:
            # Return any paris
            # Does not contain any zero
        
        for i in range(n, 0, -1):
            complement = n - i
            if '0' in str(i) or '0' in str(complement):
                continue
            elif n - i > 0 :
                return [i, n-i]
        # Complexity:
        # Time: O(nlogn) -> because of the '0' check
        # Space: O(1)
```



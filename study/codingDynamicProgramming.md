---
title: dynamic programming
permalink: /study/codingDynamicProgramming
---

# Dynamic Programming

**Patterns to know:**  
- 1D DP (Fibonacci, House Robber).  
- 2D DP on Grids (Unique Paths, Min Path Sum).  
- Subsequence DP (LIS, LCS, Edit Distance).  
- Knapsack Variants.  
- Interval DP (Burst Balloons).  
- State Machine DP (Stocks).  
- State Compression (Bitmask DP).  
- Digit DP (counting numbers under constraints).

**How to identify:**  
- Problem asks for "maximum/minimum ways, cost, length".  
- Overlapping subproblems (same input repeated).  
- Optimal substructure (global optimum = combination of local optima).  
- Often solved recursively → memoization → tabulation.  

-----

{% include study_toc.md %}

-----

## 1. Climbing Stairs - Easy

[Leetcode Link](https://leetcode.com/problems/climbing-stairs/?envType=problem-list-v2&envId=dynamic-programming)

To understand the problem:

```terminal
4   ------------ 4 ----------
               / ^  \
3   -------  3 - ^ - ^ ------
          /  ^ - ^ - ^ ------
2   ---- 2 - ^ - 2 - 2 ------
       / ^   ^ - ^ - | ------
1   --1- ^ - 1 - ^ - 1 ------
      |  ^   |   ^   |
S   --o--o---o---o---o-------

| -> 1 Step
^ -> 2 Step
```

Solution:
```python
class Solution:
    def climbStairs(self, n: int) -> int:
        # Input: int
        # Output: int
        # Description:
            # Only 1 or 2 Steps
            # Find distinct ways for Summing to n
        
        # Example 1:
        # Input -> [1]
        # Output -> 1 way
        # Example 2:
        # Input -> [2]
        # Output -> [1+1], [2] = 2 Ways
        # Input -> 3
        # Output -> [1+1+1], [1+2], [2+1] = 3 ways

        # Going from bottom of the tree up

        # 0) If there is 1 stair -> only 1 way up
        # If there are 2 stairs -> 2 ways up
        if n <= 2:
            return n

        # Initialize
        # We at ladder 3, one step before = 2, and there is 2 way to reach it (aka step a single step, or jump two steps)
        # We at ladder 3, two steps beofer = 1, and there is 1 way to reach it (aka step a single step)
        one_step_before = 2 # ways to reach THE step ahead
        two_steps_before = 1 # ways to reach THE 2 steps ahead
        total = 0

        # Iterate from 3, meaning we are going up the "ladder"
        for _ in range(3, n+1):
            # to reach 3, we add the "paths" before
            total = one_step_before + two_steps_before
            # Re-assign, the two steps before, becomes one step before, as we move along
            two_steps_before = one_step_before
            # The one step before becomes the current step
            one_step_before = total
        return total
        # Complexity:
        # Time = O(n)
        # Space = O(1)
```



## 2. Pascal's Triangle - Easy

[Leetcode Link](https://leetcode.com/problems/pascals-triangle/description/?envType=problem-list-v2&envId=dynamic-programming)


```python
class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        # Input: int
        # Output: List[List[int]]
        # Description:
            # Each number is the sum of the two numbers directly above it
        # Example 1:
        # Input -> numRows = 5
        # Output -> [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
        # Example 2:
        # Input -> numRows = 1
        # Output -> [[1]]

        # Understanding by reverting the "triangle"
        # 5 | 1 4 6 4 1
        # 4 |  1 3 3 1
        # 3 |   1 2 1
        # 2 |    1 1
        # 1 |     1
        
        # Initialize with [1]
        output_list = [[1]]

        # We going up the "rows"
        for _ in range(1,numRows):
            # Get the "last" row
            prev = output_list[-1]
            # The Current becomes:
            # Middle Component "iterates" through length of previous and adds
            # e.g. len(prev) = 3, minus one to keep it in index, then use the index to add
            middle_component = [prev[i] + prev[i+1] for i in range(len(prev)-1)]
            # Append [1] to two side
            current = [1] + middle_component + [1]
            # Add to output_list
            output_list.append(current)
        return output_list
        # Complexity
        # Time = O(n^2) -> Row 1 has 1 element, row 2 has 2, … row n has n.
        # Space = O(n^2) -> If you store all rows (like in output_list), you’re storing ~ n(n+1)/2 integers.
```

## 3. Pascal's Triangle II - Easy

[Leetcode Link](https://leetcode.com/problems/pascals-triangle-ii/?envType=problem-list-v2&envId=dynamic-programming)

```python
class Solution:
    def getRow(self, rowIndex: int) -> List[int]:
        # Inputs: int
        # Output: List[int]
        # Description:
        # In Pascal's triangle, each number is the sum of the two numbers directly above it

        # Example 1:
        # Inputs -> rowIndex = 3
        # Outputs -> [1,3,3,1]

        # Example 2:
        # Inputs -> rowIndex = 0
        # Outputs -> [1]

        # Example 3:
        # Inputs -> rowIndex = 1
        # Outputs -> [1,1]

        # Understanding:
        # 4 | 1 4 6 4 1
        # 3 |  1 3 3 1
        # 2 |   1 2 1
        # 1 |    1 1
        # 0 |     1

        # Initialize 1st row
        previous_list = [1]

        if rowIndex == 0:
            return previous_list

        # Iterate through
        for _ in range(rowIndex):
            middle_component = [previous_list[i] + previous_list[i+1] for i in range(len(previous_list)-1)]
            current_list = [1] + middle_component + [1]
            previous_list = current_list
        return current_list

        # Complexity:
        # Time = O(n^2)
        # Space = O(n)

```

## 4. Counting Bits - Easy

[Leetcode Link](https://leetcode.com/problems/counting-bits/?envType=problem-list-v2&envId=dynamic-programming)

```python
class Solution:
    def countBits(self, n: int) -> List[int]:
        # Inputs: int
        # Outputs: List[int]
        # Description:
            # For 0...n
            # Convert to Binary

        # Example 1:
        # Input -> n = 2
        # Output -> [0,1,1] 

        # Example 2:
        # Input -> n = 5
        # Output -> [0,1,1,2,1,2]

        # Brute Force appraoch
        # output_list = []
        # for num in range(n+1):
        #     current_sum = sum(int(_) for _ in bin(num)[2:])
        #     output_list.append(current_sum)
        # return output_list

        # DP approach
        # 0) Setup
        # Initialize an array of 0s -> [0,0,0,0,0,0] for n = 5
        output_list = [0] * (n + 1)
        # Iterate from 0...n+1
        # 0 has no bit, which is already captured
        for num in range(1, n + 1):
            # num >> 1 = Chop off the last bit and return the integer
            # E.g. 
            # 13231 >> 1 = 6615
            # >>> bin(13231)
            # '0b11001110101111'
            # >>> bin(13231>>1)
            # '0b1100111010111'
            # num & 1 = last bit (0 if even, 1 if odd)
            # The trick here is:
            # 1 → 001  (1 one-bit)
            # 2 → 010  (1 one-bit)
            # 3 → 011  (2 one-bits)
            # 4 → 100  (1 one-bit)
            # 5 → 101  (2 one-bits)
            # 6 → 110  (2 one-bits)
            # 7 → 111  (3 one-bits)
            # Example:
            # 5 (101) → 2 (10)
            # 6 (110) → 3 (11)
            # 7 (111) → 3 (11)
            # You are not "directly" using the previous number
            # You are using the "number" that is off the same "bit"
            # So overall, we get:
            output_list[num] = output_list[num >> 1] + (num & 1)
        return output_list

        # Complexity
        # Time -> O(n)
        # Space -> O(n) -> Output list has size n+1

```
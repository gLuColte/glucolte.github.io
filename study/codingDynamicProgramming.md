---
title: dynamic programming
permalink: /study/codingDynamicProgramming
---

# Dynamic Programming {#dynamic-programming}

**Patterns to know:**  
- 1D DP (Fibonacci, House Robber).  
- 2D DP on Grids (Unique Paths, Min Path Sum).  
    - If it’s pure counting with 2 moves (right/down) → yes, think Pascal/binomial.
    - If it’s extra rules → switch to general DP grid filling (but it’s the same spirit).
    - If it’s just paths with no conditions → you can even skip DP and use the formula directly (C(m+n-2, m-1)).
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

## Climbing Stairs - Easy {#climbing-stairs---easy}

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



## Pascal's Triangle - Easy {#pascals-triangle---easy}

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

## Pascal's Triangle II - Easy {#pascals-triangle-ii---easy}

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

## Counting Bits - Easy {#counting-bits---easy}

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


## Unique Paths - Medium {#unique-paths---medium}

[Leetcode Link](https://leetcode.com/problems/unique-paths/?envType=problem-list-v2&envId=dynamic-programming)


```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        # Inputs: int, int
        # Outputs: int
        # Description:
            # Initially located at the top left corner (0,0)
            # Tries to move to bottom right
            # Can only move down or right
            # Return the number of possible unique paths that the robot can take to reach the bottom righ corner

        # Example 1:
        # Inputs -> 3,7
        # Outputs -> 28

        # Example 2:
        # Inputs -> 3,2
        # Outputs -> 3

        # Think of it as Pascal Triangle
        # 3x3
        # 1 1 1
        # 1 2 3
        # 1 3 6

        # 5x4
        # 1  1  1  1  1 
        # 1  2  3  4  5
        # 1  3  6  10 15
        # 1  4  10 20 35 

        # Create the 2d grid first
        dp = [[1] * n for _ in range(m)]
        # Fill the rest of the table
        # i goes down
        for i in range(1,m):
            # j goes right
            for j in range(1,n):
                # E.g. i = 1, j = 1 --> 1 + 1 = 2
                # E.g. i = 2, j = 6 --> 2 + 6 = 7
                dp[i][j] = dp[i-1][j] + dp[i][j-1]

        # Answer
        return dp[m-1][n-1]
```

## Unique Paths II - Medium {#unique-paths-ii---medium}

[Leetcode Link](https://leetcode.com/problems/unique-paths-ii/?envType=problem-list-v2&envId=dynamic-programming)

```python
class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:
        # Inputs: List[List[int]]
        # Outputs: int
        # Description:
        #   Given a Grid m x n
        #   Start at (0,0)
        #   Move to the bottom right (m-1, n-1)
        #   Can only move down or right
        #   Obstacles are marked as 1, spaces as 0
        #   Return the number of possible unique paths to the bottom right
        #
        # Example 1
        # Inputs: obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]
        # Output: 2
        #
        # Pascal Triangle intuition (no obstacles):
        # 3x3
        # 1 1 1
        # 1 2 3
        # 1 3 6
        #
        # With obstacles (1s act like “walls” that stop flow):
        # 1 1 1
        # 1 0 1
        # 1 1 2

        m = len(obstacleGrid)
        n = len(obstacleGrid[0])

        # Edge case: start or end blocked → 0 paths
        if obstacleGrid[0][0] == 1 or obstacleGrid[m-1][n-1] == 1:
            return 0

        # pathGrid[i][j] = number of ways to reach (i, j)
        # Note - a mistake made here is assuming pathGrid initialize with 1
        pathGrid = [[0] * n for _ in range(m)]

        # Seed: exactly one way to “be” at the start (if not blocked)
        pathGrid[0][0] = 1

        # First column: only from above; if an obstacle appears,
        # everything below remains 0 (no way around in the same column)
        for i in range(1, m):
            pathGrid[i][0] = 0 if obstacleGrid[i][0] == 1 else pathGrid[i-1][0]

        # First row: only from left; if an obstacle appears,
        # everything to the right remains 0 (no way around in the same row)
        for j in range(1, n):
            pathGrid[0][j] = 0 if obstacleGrid[0][j] == 1 else pathGrid[0][j-1]

        # Inner cells: if not an obstacle → sum of top + left (Pascal with walls)
        for i in range(1, m):
            for j in range(1, n):
                # If there is an obstacle
                if obstacleGrid[i][j] == 1:
                    pathGrid[i][j] = 0
                # If there is no obstacle, sum top and left
                else:
                    pathGrid[i][j] = pathGrid[i-1][j] + pathGrid[i][j-1]

        # Answer: ways to reach bottom-right
        return pathGrid[m-1][n-1]

        # Complexity:
        # Time = O(mn)
        # Space = O(mn)

```

## Minimum Path Sum - Medium {#minimum-path-sum---medium}

[Leetcode Link](https://leetcode.com/problems/unique-paths-ii/description/?envType=problem-list-v2&envId=dynamic-programming)

```python
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        # Inputs: List[List[int]]
        # Outputs: int
        # Descriptions:
            # Grid with NON Negative values
            # Find a path from top left to bottom right, minimizes the sum

        # Example 1:
        # Inputs -> grid = [[1,3,1],[1,5,1],[4,2,1]]
        # Outputs -> 7
        # Example 2:
        # Inputs -> grid = [[1,2,3],[4,5,6]]
        # Outputs -> 12
        # Understanding:
            # Think of as Tolls per Cell
            # You are finding the "accumulative minimum cost"
            # The local minimum will eventually build the "global" minimum

        # Setup
        m = len(grid)
        n = len(grid[0])

        # Prefix sums along first row
        for j in range(1,n):
            grid[0][j] += grid[0][j-1]

        # Prefix sums along the first column
        for i in range(1,m):
            grid[i][0] += grid[i-1][0]

        # Fill the rest
        for i in range(1,m):
            for j in range(1,n):
                grid[i][j] += min(grid[i-1][j], grid[i][j-1])

        return grid[m-1][n-1]
        # Complexity
        # Time -> O(nm)
        # Space -> O(nm)
```


## Is Subsequence - Easy {#is-subsequence---easy}

[Leetcode Link](https://leetcode.com/problems/unique-paths-ii/description/?envType=problem-list-v2&envId=dynamic-programming)

```python
class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        # Inputs: str, str
        # Outputs: bool
        # Description:
            # Subsequence -> s is formed by deleting some(or nill) of the characters
            # Preserving the order
            # "ace" -> abcde -> true
            # "aec" -> abcde -> false
        # Example 1
        # Inputs -> s = "abc", t = "ahbgdc"
        # Output -> True

        # Example 2
        # Inputs -> s = "axc", t = "ahbgdc"
        # Output -> False
        
        # Edge Case
        if s == "":
            return True

        # Iterate and pointer
        s_pointer = 0
        for character in t:
            if character == s[s_pointer]:
                s_pointer += 1
                # Early exit
                if s_pointer == len(s):
                    return True
        return False

        # Walk through an example
        # t = ahbgdc
        # s = abc
        # Iteration 1
            # a, s_pointer = 0
            # a == s[s_pointer] --> s_pointer += 1 = 1
        # Iteration 2
            # h, s_pointer = 1
            # h != s[s_pointer] 
        # Iteration 3
            # b, s_pointer = 1
            # b == s[pointer] --> s_pointer += 1 = 2
        # Iteration 4
            # g, s_pointer = 2
            # g != s[s_pointer]
        # iteration 5
            # d, s_pointer = 2
            # d != s[s_pointer]
        # iteration 6
            # c, s_pointer = 2
            # c == s[s_pointer] -> s_pointer += 1 = 3
            # s_pointer == len(s) -> Return True
```

## Fibonacci Number - Easy {#fibonacci-number---easy}

[Leetcode Link](https://leetcode.com/problems/unique-paths-ii/description/?envType=problem-list-v2&envId=dynamic-programming)

```python
class Solution:
    def fib(self, n: int) -> int:
        # Inputs: int
        # Outputs: int
        # Description:
            # F(n-1) + F(n-2) 
        
        # Typical Recursion Appraoch
        # if n == 0:
        #     return 0
        # if n == 1:
        #     return 1
        
        # return self.fib(n-1) + self.fib(n-2)
        # Complexity
        # Time O(2^n)
        # Space O(n)

        # Dynamic Programming approach
        if n < 2:
            return n
        # We create a list
        dp = [0,1]
        # We calculate the list
        for i in range(2,n+1):
            # Append the value
            dp.append(dp[i-1] + dp[i-2])
        return dp[n]
        # Complexity:
        # Time O(n)
        # Space O(n)

```

## Nth Tribonacci Number {#nth-tribonacci-number}

[Leetcode Link](https://leetcode.com/problems/unique-paths-ii/description/?envType=problem-list-v2&envId=dynamic-programming)

```python
class Solution:
    def tribonacci(self, n: int) -> int:
        # Inputs: int
        # Outputs: int
        # Description:
            # T3 = T0 + T1 + T2

        # Setup
        dp = [0, 1, 1]

        # Iterate
        for i in range(3, n+1):
            dp.append(dp[i-3] + dp[i-2] + dp[i-1])
        return dp[n]
        # Complexity
        # Time - O(n)
        # Space - O(n)
```

## Maximum Repeating Substring - Easy {#maximum-repeating-substring---easy}

[Leetcode Link](https://leetcode.com/problems/unique-paths-ii/description/?envType=problem-list-v2&envId=dynamic-programming)


```python
class Solution:
    def maxRepeating(self, sequence: str, word: str) -> int:
        # Inputs: str, str
        # Outputs: int
        # Description:
            # Occurence of "word" in sequence
        # Count
        k = 0
        # Current Word
        cur = word
        # Keep Iterating and add word to cur
        # Breaks when it is no longer a substring
        while cur in sequence:
            k += 1
            cur += word
        return k
        # Think about it in a reverse manner
        # how many words keeps it in "Sequence"
        # Complexity:
        # Time - O(kn) - n = len of sequence
        # Space - O(km) - m = len of word


```

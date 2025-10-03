---
title: arrays and strings
permalink: /study/codingArraysStrings
---

# Arrays & Strings {#arrays-strings}

**Patterns to know:**  
- Two Pointers (fast/slow, inward/outward).  
- Sliding Window.  
- Prefix Sum / Difference Array.  
- Sorting + Greedy.  
- Binary Search on answer.

**How to identify:**  
- Input is just a flat array or string.  
- Asked to find subarray/subsequence with certain property.  
- "Longest/shortest substring" → usually sliding window.  
- "Find pair/triplet" → often two pointers + sorting.  

-----

{% include study_toc.md %}

-----

## Two Sums - Easy {#two-sums---easy}

[Leetcode Link](https://leetcode.com/problems/two-sum/description/?envType=problem-list-v2&envId=array&)

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Input -> nums, target
            # Always 1 Solution
        # Constraints 
            # nums[index1] + nums[index2] = target
        # Output -> [index1, index2]

        # Example:
        # nums = 2,7,11,15, target = 9
        # output = [0,1] -> 2+7 = 9

        # Example:
        # nums = 3,2,4, target = 6
        # output = [1,2] -> 2+4 = 6

        # Use a Hash to store seen compliments
        seen = {}

        # Iterate with index
        for index, num in enumerate(nums):
            # If other half is in the keys
            if num in seen.keys():
                # We found it!
                return [seen[num], index]
            # If not, we store the "other half" and its index
            compliment = target - num
            seen[compliment] = index 
        return []

        # Comlpexity:
        # Time = O(n)
        # Space = O(n)
        # n is number of items in the list, as we iterate through.
        # The worst case is finding the compliment as the last item
```

## 3Sum Closest - Medium {#3sum-closest---medium}

[Leetcode Link](https://leetcode.com/problems/3sum-closest/?envType=problem-list-v2&envId=array&)

```python
class Solution:
    def threeSumClosest(self, nums: List[int], target: int) -> int:
        # Input -> nums, target
        # Output -> int

        # Example:
        # Input: nums = [-1,2,1,-4], target = 1
        # Output: 2
        # Explanation: The sum that is closest to the target is 2. (-1 + 2 + 1 = 2).

        # 0) Sort the list, this make it in "order"
        nums.sort()

        # length of list
        n = len(nums)

        # Initialize to first 3
        best_sum = nums[0] + nums[1] + nums[2]
        best_gap = abs(target - best_sum)

        # Lock i, i can only go till n-2
        for i in range(n - 2):
            # We get "Left" and "Right" indices
            l, r = i + 1, n - 1
            # While Left is "left"
            while l < r:
                # Get Sum
                s = nums[i] + nums[l] + nums[r]
                # Find gap to target
                gap = abs(target - s)
                if gap < best_gap:
                    # Update running check if it is smaller
                    best_gap = gap
                    best_sum = s
                # Since it is sorted list
                # If s is less, means we need to move Left 
                if s < target:
                    l += 1
                # If s is more, means we need to move Right
                elif s > target:
                    r -= 1
                # If it matches the target
                else:
                    return target  # exact match, means we hit what we want
        # Best
        return best_sum
        # Complexity;
        # Time -> O(n^2)
        # Space -> O(1)
```


## 4Sum - Medium {#4sum---medium}

[Leetcode Link](https://leetcode.com/problems/4sum/submissions/1753588794/?envType=problem-list-v2&envId=array&)

```python
class Solution:
    def fourSum(self, nums: List[int], target: int) -> List[List[int]]:
        # Input -> List[int], int
        # Output -> List[List[int]]
        # Descprtion:
        # Return a list of unique quadruplets that hits the target

        # Example 1
        # Input: nums = [1,0,-1,0,-2,2], target = 0
        # Output: [[-2,-1,1,2], [-2,0,0,2],[-1,0,0,1]]

        # Example 2
        # Input: nums = [2,2,2,2], target = 0
        # Output: [[2,2,2,2]]

        # 0) Sort
        nums.sort()
        output_list = []
        seen = set()
        n = len(nums)
        # 1) We start by giving a pointer for the first 2 index (i,j)
        for i in range(n-3):
            for j in range(i+1, n-2):
                # Then we create left and right
                l, r = j+1, n-1
                while l < r:
                    current_sum = nums[i] + nums[j] + nums[l] + nums[r]
                    if current_sum < target:
                        l += 1
                    elif current_sum > target:
                        r -= 1
                    else:
                        # Set -> Set comparison ignores order
                        current_set = (nums[i], nums[j], nums[l], nums[r])
                        if current_set not in seen:
                            seen.add(current_set)
                            output_list.append(list(current_set))
                        # Force move r pointer
                        r -= 1
                        # Ignoring duplicates
                        while l < r and nums[r] == nums[r+1]:
                            r -= 1
        return output_list
        # [b,c,g,d,f,a,e,h]
        # Sorted          -> [a,b,c,d,e,f,g,h]
        # Lock i,j        -> [i,j,l,        r]
            # Iteration 2 -> [i,j,l,       r ] if sum > target -> Move right
            # Iteration 2 -> [i,j,  l,      r] if sum < target -> Move left
        # if it is equal to target -> means we found one can break, no need to adjust as we are finding equals
        # Complexity:
        # Time = O(n^3)
        # Space = O(m)
        # Taken - 491ms
```

The GPT Solution by adding "checks" that skips duplicates, speed up to 15ms

```python
class Solution:
    def fourSum(self, nums: List[int], target: int) -> List[List[int]]:
        nums.sort()
        n = len(nums)
        res: List[List[int]] = []

        for i in range(n - 3):
            # skip duplicate anchors i
            if i > 0 and nums[i] == nums[i - 1]:
                continue

            # prune for i: smallest and largest sums achievable with this i
            min_i = nums[i] + nums[i + 1] + nums[i + 2] + nums[i + 3]
            if min_i > target:
                break
            max_i = nums[i] + nums[n - 1] + nums[n - 2] + nums[n - 3]
            if max_i < target:
                continue

            for j in range(i + 1, n - 2):
                # skip duplicate anchors j
                if j > i + 1 and nums[j] == nums[j - 1]:
                    continue

                # prune for j
                min_j = nums[i] + nums[j] + nums[j + 1] + nums[j + 2]
                if min_j > target:
                    break
                max_j = nums[i] + nums[j] + nums[n - 1] + nums[n - 2]
                if max_j < target:
                    continue

                l, r = j + 1, n - 1
                a, b = nums[i], nums[j]  # local refs are a hair faster
                while l < r:
                    s = a + b + nums[l] + nums[r]
                    if s < target:
                        l += 1
                    elif s > target:
                        r -= 1
                    else:
                        res.append([a, b, nums[l], nums[r]])
                        l += 1
                        r -= 1
                        # skip duplicates on both sides
                        while l < r and nums[l] == nums[l - 1]:
                            l += 1
                        while l < r and nums[r] == nums[r + 1]:
                            r -= 1
        return res

```


## Remove Duplicates from Sorted Array - Easy {#remove-duplicates-from-sorted-array---easy}

[Leetcode Link](https://leetcode.com/problems/remove-duplicates-from-sorted-array/description/?envType=problem-list-v2&envId=array&)

```python
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        # Input: List[int]
        # Output: int

        # Example 1:
        # Input -> nums = [1,1,2]
        # output -> 2, nums = [1,2,_]

        # Example 2:
        # Input -> nums = [0,0,1,1,1,2,2,3,3,4]
        # Output -> 5, nums = [0,1,2,3,4,_,_,_,_,_]

        # 0) Setup
        seen = set()
        
        # 1) Iterate backwards -> [a,b,c,d,e,f,g,h] 
        for num_index in range(len(nums)-1, -1, -1):
            # 2) Check if number in seen
            if nums[num_index] in seen:
                # If it is, we just remove it
                del nums[num_index]
            else:
                # If it is NOT, we add to seen
                seen.add(nums[num_index])

        return len(nums)

        # Complexity:
        # Time = O(n^2)
            # Beacuse lists shift elements
        # Space = O(n)
```


## Remove Element - Easy {#remove-element---easy}

[Leetcode Link](https://leetcode.com/problems/remove-element/description/?envType=problem-list-v2&envId=array&)

```python
class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        # Input: List[int], int
        # Output: int
        # Constraints:
            # Inplace Removable
            # Return Number of Element in nums not equal to val 

        # Example:
        # Input -> nums = [0,1,2,2,3,0,4,2], val = 3
        # Output -> 2

        # 0) Setup
        n = len(nums)
        # When you delete, index shifts, so you need to work "backwards"
        for num_index in range(n-1, -1, -1):
            if nums[num_index] == val:
                del nums[num_index]
        return len(nums)

        # Complexity
        # Time = O(n^2) -> Because deletion
        # Space = O(1) -> No such thing as Nil
```

## Maximum Sum of an Hourglass - Medium {#maximum-sum-of-an-hourglass---medium}

[Leetcode Link](https://leetcode.com/problems/maximum-sum-of-an-hourglass/description/)

```python
class Solution:
    def maxSum(self, grid: List[List[int]]) -> int:
        # Inputs: List[List[int]]
        # Outputs: int
        # Description: 
            # hour glass
            # Maximum sum
            # Finding maximum sum of 3x3 - [i+1][j], [i+1][j+2]
            # Assuming MxN
        # Example 1:
        # Inptus: grid = [[1,2,3], [4,5,6], [7,8,9]]
        # Outputs: 1+2+3+5+7+8+9 = 35

        # Brute force first approrach:
        # Carving out a sub grid
        # Setup
        # m = len(grid)
        # n = len(grid[0])
        
        # # If it is a 3x3
        # if m == 3 and n == 3:
        #     return sum(sum(inner) for inner in grid) - grid[1][0] - grid[1][2]
        
        # # Else
        # maximum_sum = 0
        # for i in range(0, m):
        #     if i + 3 > m:
        #         break
        #     for j in range(0, n):
        #         if j + 3 > n:
        #             break
        #         sub_grid = [row[j:j+3] for row in grid[i:i+3]]
        #         current_sum = sum(sum(inner) for inner in sub_grid) - sub_grid[1][0] - sub_grid[1][2]
        #         if current_sum > maximum_sum:
        #             maximum_sum = current_sum
        # return maximum_sum

        # GPT Guidance:
        # Don't carve out sub grid, index the 7 cells directly
        m,n = len(grid), len(grid[0])
        maximum_s = 0
        for i in range(m-2):
            # Define rows
            row0, row1, row2 = grid[i], grid[i+1], grid[i+2]
            for j in range(n-2):
                # Hour glass: top row + middle centre + bottom row
                s = row0[j] + row0[j+1] + row0[j+2] + row1[j+1] + row2[j] + row2[j+1] + row2[j+2]
                if maximum_s < s:
                    maximum_s = s
        return maximum_s
        # Complexity:
        # Time: O(mn)
        # Space: O(1)

```


## Grumpy Bookstore Owner - Medium {#grumpy-bookstore-owner---medium}

[Leetcode Link](https://leetcode.com/problems/grumpy-bookstore-owner/description/)

```python
class Solution:
    def maxSatisfied(self, customers: List[int], grumpy: List[int], minutes: int) -> int:
        # Inputs: List[int], List[int], minute
        # Outputs: int
        # Description:
            # Store open for N (length of list)
            # Customers represents the "element"
            # Grumpy list
            # Can stay "non grumpy" for minutes
            # What is the most ideal way to have maximum satisifed customers?
        # Example 1
        # Inputs:
            # Customer -> [1,0,1,2,1,1,7,5]
            # Grumpy ->   [0,1,0,1,0,1,0,1]
            # Mintues ->   3 
        # Outputs:
            # 16
                # We can see 1 + 5 is the largest
                # Hence we use that "Minutes" to stay not grumpy
                # [1,1,1] + [1,7,5] = 16
        
        # First identify the index that gets grumpy
        # Can this be treated as 2d matrix and find the best cost path?
        n = len(customers)

        # Baseline -> Already satisifed
        baseline = 0
        for i in range(n):
            if grumpy[i] == 0:
                baseline += customers[i]

        # Sliding window 
        gain = 0
        max_gain = 0

        # Initial Window
        # Note, if minutes > n, that means we can cover WHOLE customers
        # If n > minutes, then we will be range(0,3) -> which means we started from 0 to minutes
        for i in range(min(minutes,n)):
            if grumpy[i] == 1:
                gain += customers[i]
        # Max gain set to initial gain we calculated
        max_gain = gain

        # Slide, starting from minutes
        # Note, if minutes > n, it would exists
        for i in range(minutes, n):
            # i = the NEW index entering the window (right edge)
            if grumpy[i] == 1:
                gain += customers[i]
            # j = the OLD index leaving the window (left edge)
            j = i - minutes
            if grumpy[j] == 1:
                gain -= customers[j]
            
            # Basically we are sliding now:
            # initial window: [0,1,2] → gain from grumpy==1 here
            # i=3, j=0 → window [1,2,3]  (add idx 3, remove idx 0)
            # i=4, j=1 → window [2,3,4]  (add idx 4, remove idx 1)
            # i=5, j=2 → window [3,4,5]  (add idx 5, remove idx 2)
            # i=6, j=3 → window [4,5,6]  (add idx 6, remove idx 3)
            # i=7, j=4 → window [5,6,7]  (add idx 7, remove idx 4)
            
            # If it is greater
            if gain > max_gain:
                max_gain = gain
        return baseline + max_gain


```


## Longest Consecutive Sequence - Medium {#longest-consecutive-sequence---medium}

[Leetcode Link](https://leetcode.com/problems/longest-consecutive-sequence/?envType=problem-list-v2&envId=oizxjoit&)

Initial attempt:

```python
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        # Inputs: List[int]
        # Outputs: int
        # Descrption:  
            # Return the Longest consecutive sequence
            # Must run in O(n)

        # Example 1:
        # Inputs: nums = [100,4,200,1,3,2]
        # Outputs: 4 -> 1,2,3,4

        # Example 2:
        # Inputs: nums = [0,3,7,2,5,8,4,6,0,1]
        # Outputs: 9 -> 0,1,2,3,4,5,6,7,8
        # Setup
        n = len(nums)

        # Edge case catching
        if n == 0 :
            return 0

        # Sorting
        nums.sort()
        max_sequence = 0
        current_sequence = 0
        for i in range(1, n):
            if nums[i] == nums[i-1] + 1:
                current_sequence += 1
            elif nums[i] == nums[i-1]:
                continue
            else:
                max_sequence = max(max_sequence, current_sequence)
                current_sequence = 0
        if max_sequence <= current_sequence:
            max_sequence = current_sequence

        return max_sequence + 1
        # Complexity
        # You call nums.sort().
        # Sorting an array of length n takes O(n log n) in the average case (Timsort in Python).
        # After sorting, your loop runs in O(n).
        # Together, that makes your solution O(n log n), not O(n).
        # Hence this solution is incorrect
```

Correct Attempt:

```python
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        # Inputs: List[int]
        # Outputs: int
        # Descrption:  
            # Return the Longest consecutive sequence
            # Must run in O(n)

        # Example 1:
        # Inputs: nums = [100,4,200,1,3,2]
        # Outputs: 4 -> 1,2,3,4

        # Example 2:
        # Inputs: nums = [0,3,7,2,5,8,4,6,0,1]
        # Outputs: 9 -> 0,1,2,3,4,5,6,7,8
        # Setup
        s = set(nums)

        longest = 0
        # Iterate each number
        for x in s:
            # if x - 1 is NOT in s
            if x - 1 not in s:
                # Start a streak check 
                length = 1
                # keep plusing until it is NOT
                while x + length in s:
                    length += 1
                # Get longest
                longest = max(longest, length)
        return longest
```



## Longest Substring Without Repeating Characters - Medium {#longest-substring-without-repeating-characters---medium}

[Leetcode Link](https://leetcode.com/problems/longest-substring-without-repeating-characters/?envType=problem-list-v2&envId=oizxjoit&)

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Inputs: str
        # Outputs: int
        # Description:
            # Longest substring without duplicates

        # Example 1:
            # Inputs: "abcabcbb"
            # Outputs: 3 -> longest "abc" substring without duplicates
        # Example 2:
            # inputs: "bbbbbb":
            # Outputs: 1 -> "b"
        # Example 3:
            # Inputs: "pwwkew"
            # Outputs: 3 -< "wke"
        
        # last: maps a character to the last index where we saw it
        last = {}

        # start: left edge of the "current window" (inclusive)
        # best: length of the best window we've seen so far
        start = 0
        best = 0

        # Iterate over each character and its index
        for i, ch in enumerate(s):
            # If we've seen ch, before AND its last position is inside
            # the current window [ start .. i-1], we must move left 
            # edge (Strat) to one past that previous position to avoid duplicates
            if ch in last and last[ch] >= start:
                # Drop everything up to and including previous ch.
                start = last[ch] + 1
            # Record/update last index where we saw ch
            last[ch] = i

            # The current window is [start .. i]. Its length is i - start + 1.
            # Update best if this window is longer than what we had.
            best = max(best, i - start + 1)

        return best
```

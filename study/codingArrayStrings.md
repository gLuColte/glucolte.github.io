---
title: arrays and strings
permalink: /study/codingArraysStrings
---

# Arrays & Strings

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


## 1. Two Sums - Easy

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

## 2. 3Sum Closest - Medium

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


## 3. 4Sum - Medium

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


## 4. Remove Duplicates from Sorted Array - Easy

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


## 5. Remove Element - Easy

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
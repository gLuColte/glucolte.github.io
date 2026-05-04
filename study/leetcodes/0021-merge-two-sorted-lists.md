---
layout: leetcode
title: "Merge Two Sorted Lists"
permalink: /study/leetcodes/0021-merge-two-sorted-lists
leetcode_id: 21
difficulty: Unknown
leetcode_url: https://leetcode.com/problems/merge-two-sorted-lists/submissions/1994616569/
primary_pattern: "Linked Lists"
topics:
  - "Linked List"
  - "Recursion"
date_solved: 2026-05-04
time_taken: "13:19"
language: Python3
---

# Merge Two Sorted Lists

- **Difficulty:** Unknown
- **Primary pattern:** Linked Lists
- **Tags:** Linked List, Recursion
- **Time taken:** 13:19
- [LeetCode Link](https://leetcode.com/problems/merge-two-sorted-lists/submissions/1994616569/)

## Key Idea

- using a "dummy" head is the key idea, it allow syou to call dummy.next to point back to the start of the list
- current = current.next, means you are moving to next each iteration


## Solution

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        # Example 1
            # Input: list1 = [1,2,4], list2 = [1,3,4]
            # Output: [1,1,2,3,4,4]
        # Example 2:
            # Input: list1 = [], list2 = []
            # Output: []
        # Example 3:
            # Input: list1 = [], list2 = [0]
            # Output: [0]
        # Initialize by creating a dummy Node
        dummy = ListNode()
        current = dummy
        
        # Iterate if List1 and List 2 still hold
        while list1 and list2:
            # If list 1 is less
            if list1.val <= list2.val:
                # Set "next" for current to list1
                current.next = list1
                # Change list1 to next
                list1 = list1.next
            else:
                # Otherwise
                current.next = list2
                list2 = list2.next
            # Push current to net
            current = current.next
        # If one of the list still has values
        if list1:
            current.next = list1
        if list2:
            current.next = list2
        return dummy.next
```

## Complexity

- Time: O(m+n) -> there are 2 lists
- Space: O(1) -> You are not storing anything

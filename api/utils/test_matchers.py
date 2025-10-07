import collections
from unittest.util import _count_diff_all_purpose, _count_diff_hashable


class StringContaining:
    def __init__(self, value):
        self.value = value

    def __eq__(self, other):
        return self.value in other


class AnyOrderedArray:
    def __init__(self, value):
        self.value = value

    def __eq__(self, other):
        # copied from assertCountEqual
        first_seq = list(self.value)
        second_seq = list(other)
        try:
            first = collections.Counter(first_seq)
            second = collections.Counter(second_seq)
        except TypeError:
            # Handle case with unhashable elements
            differences = _count_diff_all_purpose(first_seq, second_seq)
        else:
            if first == second:
                return
            differences = _count_diff_hashable(first_seq, second_seq)
        return not differences

    def __ne__(self, other):
        return not self.__eq__(self, other)

    def __repr__(self):
        return f'AnyOrderedArray({self.value})'

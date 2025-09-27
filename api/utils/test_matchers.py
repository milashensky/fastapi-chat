class StringContaining:
    def __init__(self, value):
        self.value = value

    def __eq__(self, other):
        return self.value in other
import sys
from datetime import date

# Windows: примусово використовуємо UTF-8 для коректного виводу кирилиці
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stdin.reconfigure(encoding="utf-8")


def print_numbers() -> None:
    """Рівень 1: вивести на екран числа від 1 до 10."""
    for number in range(1, 11):
        print(number)


def average_of_three(a: float, b: float, c: float) -> float:
    """Рівень 2: середнє значення трьох чисел."""
    return (a + b + c) / 3


def age_from_birth_year(birth_year: int) -> int:
    """Рівень 3: вік користувача за роком народження."""
    return date.today().year - birth_year


class Book:
    """Рівень 4: клас «Книга» з назвою, автором та роком видання."""

    def __init__(self, title: str, author: str, year: int) -> None:
        self.title = title
        self.author = author
        self.year = year

    def describe(self) -> str:
        return f'"{self.title}" — {self.author}, {self.year} р.'


if __name__ == "__main__":
    print("Рівень 1: числа від 1 до 10")
    print_numbers()

    print("\nРівень 2: середнє значення трьох чисел")
    a = float(input("Введіть перше число: "))
    b = float(input("Введіть друге число: "))
    c = float(input("Введіть третє число: "))
    print(f"Середнє значення: {average_of_three(a, b, c)}")

    print("\nРівень 3: визначення віку за роком народження")
    birth_year = int(input("Введіть рік народження: "))
    print(f"Ваш вік: {age_from_birth_year(birth_year)} років")

    print("\nРівень 4: клас «Книга»")
    book = Book(title="Кобзар", author="Тарас Шевченко", year=1840)
    print(book.describe())

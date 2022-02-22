- import expenses via csv
  - csv/manual format: text file containing copy paste from an excel sheet (columns tab delineated)
- see expenses for a month
- see budget for a month
- see remaining budget for a month


### DB

balance (beginning of month values)
- amount: the total amount of money available
- spend_surplus: total amount of unspent spend budget
- invest_surplus: total amount of unspent investment budget

budget (given a certain month)
most recent month budget is used if a budget isn't available for a given month
- total: total income for the month

expense
available types:
'Groceries',
'Household Goods',
'Clothes',
'Entertainment',
'Material Items',
'Dining',
'Transportation',
'Miscellaneous',
'Medical/Healthcare',
'Utilities',
'Travel',
'Invest',

### TODO
- remove server prompt, instead build into ui

### EVENTUAL TODO
- auto api calls to credit card statements

### DONE
- auto insert new balance every month
- show expenses ui
- support inserting entries manually through ui
- display fixed expenses
- make ui pretty and refactor ui
- month dropdown for date selection
- investing goal status should take into account this month's investing as well


#### SAMPLE
total available to invest this month = this month's amount - curr overspend + budget investing
total available to spend this month = this month's amount - curr overinvest + budget spend

budget: spend 500, invest 1000

jan amount: 1000
jan spent 300, invest 1000
feb amount: 1000 + (200) + (0) = 1200 you have 200 extra to spend
feb spent 1000, invest 1000
mar amount: 1200 + (-500) + (0) = 700 you have overspent by 300 (prev.spend_surplus + budget.spend - spent = 200 + 500 - 1000)
mar spent 2000, invest 0
apr amount: 700 + (-1500) + (1000) = 200 you are now behind 1000 on invest, because prev.invest_surplus + budget.invest - invested = 1000
apr spent 0, invest 2000
may amount: 200 + (500) + (-1000) = -300 you are now even on invest, bc prev.invest_surplus (1000) + budget.invest - invested = 0
may spent 100, invest 2000
june amount: -300 + (400) + (-1000) = -900 you are now ahead 1000 on invest, bc prev.invest_surplus (0) + budget.invest - invested = -1000
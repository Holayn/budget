# Development

## Web
```
  cd packages/web
  yarn dev
```

## Server
- Ensure .env variables are populated. See sample.env.
```
  cd packages/server
  yarn start
```

- import expenses via csv
  - csv/manual format: text file containing copy paste from an excel sheet (columns tab delineated)
- see expenses for a month
- see budget for a month
- see remaining budget for a month


### DB

balance (beginning of month values)
- amount: the total amount of money available
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
- factor in income
- allow for expense adjustment
- pretty charts
- projected expenses
- ability to add details to spending
- spending surplus should be affected by overinvestment. that's "spending"
- replace moment with day.js
- show unknown expenses regardless of month being viewed
- remove "get" from route names
- allow for adjusting "amount"
- proper db transactions

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

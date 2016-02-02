* [x] run ``npm run cli | less`` and think about how to handle the fact that the bank account is definitely known (maybe `accounts:{bank:{...}}`)
* [x] figure out how to add a default `accounts: user: {"expenses:personal:Unbekannt": {}}` for items without matches
* [x] main-aqcvs: load aqbanking CSV and save `.orig` file
* [x] main-auto: create automated properties for entries
* [x] output a `.auto` file with diffs or merge to the `.orig` JSON
* [x] main-aqcsv: allow user to specify output dir
* [x] main-auto: allow user to specify output dir
* [x] main-repl: read in all `.orig` files, then `.auto` files, then `.user` files
* [ ] main-repl: process ledger entries:
	* [x] check entries, fill in missing value for up to one account
	* [x] tally balances for accounts
	* [x] create vorpal repl
	* [x] `data` command: print data JSON
	* [x] create module for calculating accumulated hierarchy of balances; should return JSON, and also have a function to print the JSON
	* [x] `balance <account>` command: print account balances
	* [x] `balance <accounts...>` command: allow for multiple accounts
	* [ ] `register <account>` command:
		* [x] sort by date
		* [ ] column for running tally
		* [ ] filter on accounts
		* [ ] add column for number of entries (so that user can edit them by number)
	* [ ] create test for calculating balance
	* [ ] add basename and index to each entry
	* [ ] `a 1 <account> <value>` should set the `accounts.user` value to `<account>` for the first entry in the most recent `register` listing, and optionally set a value
	* [ ] `a 1` should start an interactive assignment of accounts to entry 1, especially for when multiple accounts need to be added
	* [ ] add a command to list unbalanced entries
	* [ ] add a command to list recent entries
	* [ ] add a command to set flags on entries (might use that to determine which entries are new/checked)
	* [ ] maybe allow user to modify an entry by entering YAML to merge back into the entry
* [ ] consider configuring accounts explicitly (i.e. you get a warning if an unconfigured account name is used)
* [ ] consider allowing for virtual accounts which don't need to double-balance
* [ ] consider renaming file extensions to leja1, lejb1, and lejc1
* [ ] main-repl: create an interactive cli for listing ledger data
* [ ] main-aqcsv: allow user to specify output file
* [ ] main-auto: allow user to specify output file
* [ ] cli: let user change entries, and save the changes as diffs in `.user` file
* [ ] allow for loading matchers.js instead of just matchers.json
* [ ] create a commodities class that handles multiple commodities and exchange rates at different times

# JMESPath tests

```
[
{"n":1, "accounts": {"bank": {"any:one": {}}}},
{"accounts": {"user": {"any:one": {}}}}
]

[?n > `0`]

[
  {
    "n": 1,
    "accounts": {
      "bank": {
        "any:one": {}
      }
    }
  }
]

[?accounts.*."any:one"]

[
  {
    "n": 1,
    "accounts": {
      "bank": {
        "any:one": {}
      }
    }
  },
  {
    "accounts": {
      "user": {
        "any:one": {}
      }
    }
  }
]
```


```
{
 "a": {
  "0": {"n":1, "accounts": {"bank": {"any:one": {}}}},
  "1": {"accounts": {"user": {"any:one": {}}}}
 }
}

*.*[]

[
  {
    "n": 1,
    "accounts": {
      "bank": {
        "any:one": {}
      }
    }
  },
  {
    "accounts": {
      "user": {
        "any:one": {}
      }
    }
  }
]

(*.*[])[?n > `0`]

[
  {
    "n": 1,
    "accounts": {
      "bank": {
        "any:one": {}
      }
    }
  }
]
```

```
{
 "a": {
  "0": {"n":1, "accounts": {"bank": {"any:one": {}}, "user": {"any:two": {}}}},
  "1": {"accounts": {"user": {"any:one": {}}}}
 }
}

(*.*[])[?accounts.*."any:two"]

[
  {
    "n": 1,
    "accounts": {
      "bank": {
        "any:one": {}
      },
      "user": {
        "any:two": {}
      }
    }
  }
]
```

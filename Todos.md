* [x] run ``npm run cli | less`` and think about how to handle the fact that the bank account is definitely known (maybe `accounts:{bank:{...}}`)
* [x] figure out how to add a default `accounts: user: {"expenses:personal:Unbekannt": {}}` for items without matches
* [ ] save the `.orig` file
* [ ] output a `.auto` file with diffs or merge to the `.orig` JSON
* [ ] create an interactive cli for listing ledger data
* [ ] cli: read in all `.orig` files, then `.auto` files, then `.user` files
* [ ] cli: let user change entries, and save the changes as diffs in `.user` file
* [ ] allow for loading matchers.js instead of just matchers.json
* [ ] create a commodities class that handles multiple commodities and exchange rates at different times

* [ ] run ``npm run cli | less`` and think about how to handle the fact that the bank account is definitely known (maybe `accounts:{bank:{...}}`)
* [ ] figure out how to add a default `accounts: user: {"expenses:personal:Unbekannt": {}}` for items without matches
* [ ] save the `.orig` file
* [ ] output a `.auto` file with diffs or merge to the `.orig` JSON
* [ ] create an interactive cli for listing ledger data
* [ ] cli: let user change entries, and save the changes as diffs in `.user` file
* [ ] cli: read in all `.orig` files, then `.auto` files, then `.user` files

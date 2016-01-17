* [x] run ``npm run cli | less`` and think about how to handle the fact that the bank account is definitely known (maybe `accounts:{bank:{...}}`)
* [x] figure out how to add a default `accounts: user: {"expenses:personal:Unbekannt": {}}` for items without matches
* [x] main-aqcvs: load aqbanking CSV and save `.orig` file
* [ ] main-auto: create automated properties for entries
* [ ] output a `.auto` file with diffs or merge to the `.orig` JSON
* [ ] create an interactive cli for listing ledger data
* [ ] main-aqcsv: allow user to specify output dir
* [ ] main-aqcsv: allow user to specify output file
* [ ] main-auto: allow user to specify output dir
* [ ] main-auto: allow user to specify output file
* [ ] cli: read in all `.orig` files, then `.auto` files, then `.user` files
* [ ] cli: let user change entries, and save the changes as diffs in `.user` file
* [ ] allow for loading matchers.js instead of just matchers.json
* [ ] create a commodities class that handles multiple commodities and exchange rates at different times

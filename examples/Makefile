AQCSV_FILES := $(wildcard *.csv)
ORIG_FILES := $(AQCSV_FILES:.csv=.orig)
AUTO_FILES := $(ORIG_FILES:.orig=.auto)

all: $(ORIG_FILES) $(AUTO_FILES)

%.orig: %.csv
	~/src/lejer/src/node_modules/.bin/babel-node -- ~/src/lejer/src/lib/main-aqcsv.js $<

%.auto: %.orig
	~/src/lejer/src/node_modules/.bin/babel-node -- ~/src/lejer/src/lib/main-auto.js -m ../../2016/matchers.json $<

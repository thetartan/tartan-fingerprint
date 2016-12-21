# Tartan Fingerprint

Extension for the tartan library that allows to flexibly compare tartans 
by threadcounts and/or palettes.

## Usage

After including this extension to the project, `tartan.fingerprint` will be
available. Use `tartan.fingerprint.create(string sett, object defaultColors)` 
to create a fingerprint of tartan; returned value is opaque and should 
be passed to comparison function. `tartan.fingerprint.compare(left, right)`
takes two fingerprints and returns several numbers: distance by sett, distance
by palette and aggregated value. Each of that numbers is not a kind of absolute
measure, but rather a value that should be used to decide which of tartans from
some list is closer to searched one. For example, refer to helper function
`tartan.fingerprint.search(items, fingerprint)` which accepts a list of object
(each of them should have a `fingerprint` field), and returns an ordered subset 
of items that are the best matching to provided fingerprint.  

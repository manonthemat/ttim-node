# ttim-node

Given a utf-8 encoded textfile, the node script searches wikidata for images for the newline-delimited terms.

The result will be a stringified JSON map with the term as a key and a wikimedia url as the value.

Usage: `node script.js {inputFile} [{outputFile}]`

If no outputFile is given, the result is logged to the console.

const fs = require('fs');
const request = require('node-fetch');
const md5 = require('md5');

const findWikidataIds = async (searchTerm) => {
  const response = await request(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(searchTerm.toLowerCase())}&format=json&language=en&uselang=en&type=item`);
  const { search } = await response.json();
  return search.map(obj => obj.id);
};

const getImage = async id => {
  const response = await request(`https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${id}&property=P18&format=json`);
  const { claims } = await response.json();
  return claims.P18;
};

const termWithImage = async(term) => {
  const ids = await findWikidataIds(term);
  const results = [];
  for (let i = 0; i < ids.length; ++i) {
    let id = ids[i];
    try {
      const snaks = await getImage(id);
      // just get the first
      if (snaks && snaks.length && snaks[0]) {
        const img = snaks[0].mainsnak.datavalue.value.replace(/ /g, '_');
        const hash = md5(img);
        const src = `https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash.slice(0,2)}/${img}`;
        results.push({ term, src });
      }
    } catch (err) {
      console.error(err);
    }
  }
  return results;
};

const transform = async (inFile) => {
  if (!inFile) {
    throw new Error('Please specify the input file.\n\n% node script.js {input file}\n');
  }

  const input = fs.readFileSync(inFile, 'utf-8').split('\n');
  const results = {};
  for (let i = 0; i < input.length; ++i) {
    const term = input[i];
    if (term) {
      const info = await termWithImage(input[i]);
      // just grabbing the first element right now
      if (info.length && info[0].src)
        results[term] = info[0].src;
    }
  }
  return JSON.stringify(results);
};

if (process.argv[3]) {
  transform(process.argv[2]).then(json => fs.writeFileSync(process.argv[3], json));
} else {
  transform(process.argv[2]).then(console.log);
}

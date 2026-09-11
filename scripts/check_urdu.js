require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

async function checkUrdu() {
  const res = await fetch('https://api.alquran.cloud/v1/edition?language=ur&type=translation&format=text');
  const data = await res.json();
  console.log('Available Urdu translations:');
  data.data.forEach(e => console.log(`  ${e.identifier} — ${e.englishName} (${e.name})`));
}
checkUrdu().catch(console.error);

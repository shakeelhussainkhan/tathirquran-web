import { MetadataRoute } from 'next';

const IMPORTANT_AYAHS: [number, number][] = [
  [1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7], // Al-Fatiha
  [2,255],[2,256],[2,286], // Al-Baqarah key ayahs
  [3,61], // Mubahala
  [5,3],[5,55], // Eid al-Ghadeer, Ayah of Wilayah
  [33,33], // Ayah of Purification
  [36,1], // Ya-Sin
  [55,1], // Al-Rahman
  [67,1], // Al-Mulk
  [97,1], // Al-Qadr
  [108,1],[112,1],[112,2],[112,3],[112,4], // Al-Kawthar, Al-Ikhlas
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tathirquran.com';
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/archive`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...IMPORTANT_AYAHS.map(([s, a]) => ({
      url: `${baseUrl}/ayah/${s}/${a}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}

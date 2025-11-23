export interface LicenseTerms {
  type: 'MP3 Lease' | 'WAV Lease' | 'Trackout Lease' | 'Exclusive';
  price: number;
  rights: string[];
  restrictions: string[];
  publishing: string;
  credit: string;
}

export const licenseTerms: Record<string, LicenseTerms> = {
  'MP3 Lease': {
    type: 'MP3 Lease',
    price: 45,
    rights: [
      'MP3 file',
      'Non-exclusive usage',
      '50,000 streaming cap',
      '1 commercial music video',
      'Radio play allowed',
    ],
    restrictions: [
      'Non-exclusive - beat may be sold to other artists',
      'Streaming limited to 50,000 streams',
      'Only 1 commercial music video allowed',
    ],
    publishing: '50% Buyer / 50% Heard Music (YCSYH)',
    credit: 'Must credit: Produced by Heard Music',
  },
  'WAV Lease': {
    type: 'WAV Lease',
    price: 60,
    rights: [
      'WAV file',
      'Non-exclusive usage',
      '100,000 streaming cap',
      '2 commercial music videos',
      'Radio play allowed',
    ],
    restrictions: [
      'Non-exclusive - beat may be sold to other artists',
      'Streaming limited to 100,000 streams',
      'Maximum 2 commercial music videos',
    ],
    publishing: '50% Buyer / 50% Heard Music (YCSYH)',
    credit: 'Must credit: Produced by Heard Music',
  },
  'Trackout Lease': {
    type: 'Trackout Lease',
    price: 300,
    rights: [
      'Full tracked-out stems',
      'Non-exclusive usage',
      'Unlimited streams',
      'Unlimited music videos',
      'Radio play allowed',
      'Live performances allowed',
    ],
    restrictions: [
      'Non-exclusive - beat may be sold to other artists',
    ],
    publishing: '50% Buyer / 50% Heard Music (YCSYH)',
    credit: 'Must credit: Produced by Heard Music',
  },
  'Exclusive': {
    type: 'Exclusive',
    price: 0, // Contact for price
    rights: [
      'Exclusive usage rights',
      'Unlimited streams',
      'Unlimited videos',
      'Sync rights allowed',
      'Beat removed from store',
      'Full ownership of master recording',
    ],
    restrictions: [
      'Beat will be removed from store after purchase',
    ],
    publishing: '50% Buyer / 50% Heard Music (YCSYH)',
    credit: 'Must credit: Produced by Heard Music',
  },
};


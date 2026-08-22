export interface CreditsImage
{
    key: string;
    file: string;
}

// Every photo in public/assets/credits, mapped to a texture key. Shared
// between Preloader (which loads them) and Credits (which cycles through
// them) so the list only has to be kept in sync with the folder in one place.
export const CREDITS_IMAGE_KEYS: CreditsImage[] = [
    { key: 'credits-a10', file: 'A10.jpg' },
    { key: 'credits-a12', file: 'A12.jpg' },
    { key: 'credits-a14', file: 'A14.jpg' },
    { key: 'credits-a17', file: 'A17.jpg' },
    { key: 'credits-b16', file: 'B16.jpg' },
    { key: 'credits-b24', file: 'B24.jpg' },
    { key: 'credits-img110', file: 'IMG110.jpg' },
    { key: 'credits-scan-20260819-3', file: 'Scan_20260819_3.jpg' },
    { key: 'credits-scan-20260819-4', file: 'Scan_20260819_4.jpg' },
    { key: 'credits-scan-20260820-11-3', file: 'Scan_20260820 (11)_3.jpg' },
    { key: 'credits-scan-20260820-11-4', file: 'Scan_20260820 (11)_4.jpg' },
    { key: 'credits-domgers', file: 'domgers.jpg' },
    { key: 'credits-grandad', file: 'grandad.jpg' },
    { key: 'credits-grandma', file: 'grandma.jpg' },
    { key: 'credits-img019', file: 'img019.jpg' },
    { key: 'credits-img022', file: 'img022.jpg' },
    { key: 'credits-img127', file: 'img127.jpg' },
    { key: 'credits-img193', file: 'img193.jpg' },
    { key: 'credits-lion', file: 'lion.jpg' },
    { key: 'credits-nfldom', file: 'nfldom.jpg' },
    { key: 'credits-patch2', file: 'patch2.jpg' },
    { key: 'credits-patch3', file: 'patch3.jpg' }
];

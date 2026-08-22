export interface SnackItem
{
    key: string;
    label: string;
    texture: string;
    points: number;
}

export interface SnackSet
{
    id: string;
    items: SnackItem[];
}

export const NARRATION_TITLE = "NEXT STOP: BUTLINS";

export const NARRATION_BODY = "You're off on a family trip to Butlins! Before "
    + "anyone can hit the road, the essential shopping needs doing so the "
    + "car's packed with everything the trip actually needs.";

// Max picks per set before the round locks in and moves the picks to the boot.
export const MAX_PICKS_PER_SET = 2;

export const snackSets: SnackSet[] = [
    {
        id: 'crisps',
        items: [
            { key: 'bikers', label: 'Bikers', texture: 'food-bikers', points: -1 },
            { key: 'brannigans', label: 'Brannigans', texture: 'food-brannigans', points: 2 },
            { key: 'chipsticks', label: 'Chipsticks', texture: 'food-chipsticks', points: 1 },
            { key: 'discos', label: 'Discos', texture: 'food-discos', points: -1 },
            { key: 'salt-and-shake', label: 'Salt & Shake', texture: 'food-salt-and-shake', points: 2 },
            { key: 'nik-naks', label: 'Nik Naks', texture: 'food-nik-naks', points: 1 }
        ]
    },
    {
        id: 'sweets',
        items: [
            { key: 'choc-dips', label: 'Choc Dips', texture: 'food-choc-dips', points: 2 },
            { key: 'hobnobs', label: 'Hobnobs', texture: 'food-hobnobs', points: 2 },
            { key: 'mars', label: 'Mars', texture: 'food-mars', points: -1 },
            { key: 'fruit', label: 'Fruit', texture: 'food-fruit', points: -5 },
            { key: 'fruit-salads', label: 'Fruit Salads', texture: 'food-fruit-salads', points: 1 },
            { key: 'chocolate-digestives', label: 'Choc Digestives', texture: 'food-chocolate-digestives', points: 1 }
        ]
    },
    {
        id: 'drinks',
        items: [
            { key: 'coke', label: 'Coke', texture: 'food-coke', points: -2 },
            { key: 'cola-cubes', label: 'Cola Cubes', texture: 'food-cola-cubes', points: 1 },
            { key: 'irn-bru', label: 'Irn Bru', texture: 'food-irn-bru', points: 2 },
            { key: 'space-raiders', label: 'Space Raiders', texture: 'food-space-raiders', points: 1 },
            { key: 'vegetables', label: 'Vegetables', texture: 'food-vegetables', points: -5 },
            { key: 'wham', label: 'Wham', texture: 'food-wham', points: -1 }
        ]
    }
];

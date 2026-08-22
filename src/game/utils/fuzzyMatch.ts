// Normalizes to lowercase alphanumerics-and-spaces so punctuation/apostrophe
// differences ("grey mares tail" vs "grey mare's tail") never count as typos.
function normalize (text: string): string
{
    return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

function levenshteinDistance (a: string, b: string): number
{
    const rows = a.length + 1;
    const cols = b.length + 1;
    const distances: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

    for (let i = 0; i < rows; i++) distances[i][0] = i;
    for (let j = 0; j < cols; j++) distances[0][j] = j;

    for (let i = 1; i < rows; i++)
    {
        for (let j = 1; j < cols; j++)
        {
            distances[i][j] = a[i - 1] === b[j - 1]
                ? distances[i - 1][j - 1]
                : 1 + Math.min(distances[i - 1][j - 1], distances[i - 1][j], distances[i][j - 1]);
        }
    }

    return distances[rows - 1][cols - 1];
}

// Text-input answer checking with room for typos: allows roughly one typo
// per five characters of the target answer, with a floor of 2 so even short
// answers (e.g. "Moffat") tolerate a letter swap or a missed key.
export function isCloseMatch (input: string, target: string): boolean
{
    const a = normalize(input);
    const b = normalize(target);

    if (!a)
    {
        return false;
    }

    const maxDistance = Math.max(2, Math.ceil(b.length * 0.2));

    return levenshteinDistance(a, b) <= maxDistance;
}

// Like isCloseMatch, but for when the accepted keyword only needs to appear
// somewhere inside a longer free-text answer (e.g. "the old house on Winny
// and Ivey's street" should still match the keyword "winny"). Slides a
// window the same width as the keyword across the input's words rather than
// comparing the whole strings.
export function containsCloseMatch (input: string, keyword: string): boolean
{
    const words = normalize(input).split(' ').filter(Boolean);
    const keywordWords = normalize(keyword).split(' ').filter(Boolean);
    const windowSize = keywordWords.length;

    if (!windowSize || !words.length)
    {
        return false;
    }

    for (let i = 0; i + windowSize <= words.length; i++)
    {
        const candidate = words.slice(i, i + windowSize).join(' ');

        if (isCloseMatch(candidate, keyword))
        {
            return true;
        }
    }

    return false;
}

export interface LeaderboardEntry
{
    name: string;
    character: string;
    score: number;
    created_at: string;
}

const ENDPOINT = '/api/leaderboard';

export async function submitScore (name: string, character: string, score: number): Promise<void>
{
    try
    {
        await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, character, score: Math.round(score) })
        });
    }
    catch
    {
        // Leaderboard is a bonus feature; a failed submit shouldn't block the game.
    }
}

export async function fetchTopScores (): Promise<LeaderboardEntry[]>
{
    try
    {
        const response = await fetch(ENDPOINT);

        if (!response.ok)
        {
            return [];
        }

        return await response.json();
    }
    catch
    {
        return [];
    }
}

interface Env
{
    DB: D1Database;
}

const MAX_NAME_LENGTH = 20;
const MAX_SCORE = 100000;
const TOP_N = 10;

export const onRequestGet: PagesFunction<Env> = async ({ env }) =>
{
    const { results } = await env.DB.prepare(
        'SELECT name, character, score, created_at FROM scores ORDER BY score DESC LIMIT ?'
    ).bind(TOP_N).all();

    return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) =>
{
    let body: { name?: unknown; character?: unknown; score?: unknown };

    try
    {
        body = await request.json();
    }
    catch
    {
        return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const name = typeof body.name === 'string' ? body.name.trim().slice(0, MAX_NAME_LENGTH) : '';
    const character = typeof body.character === 'string' ? body.character.trim().slice(0, MAX_NAME_LENGTH) : '';
    const score = Number(body.score);

    if (!name || !character || !Number.isInteger(score) || score < 0 || score > MAX_SCORE)
    {
        return Response.json({ error: 'Invalid submission' }, { status: 400 });
    }

    await env.DB.prepare(
        'INSERT INTO scores (name, character, score) VALUES (?, ?, ?)'
    ).bind(name, character, score).run();

    return Response.json({ ok: true }, { status: 201 });
};

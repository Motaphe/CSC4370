<?php
// Catpurrin: simple POST handler that echoes submitted review data safely.

// Basic helper to fetch POST values safely
function post_value($key) {
  return isset($_POST[$key]) ? trim($_POST[$key]) : '';
}

// Escape output for HTML
function h($value) {
  return htmlspecialchars($value ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$artist   = post_value('artist');
$album    = post_value('album');
$song     = post_value('song');
$reviewer = post_value('reviewer');
$platform = post_value('platform');
$rating   = post_value('rating');
$review   = post_value('review');

?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Thank You · Catpurrin</title>
    <style>
      :root {
        --purr-bg: #0f0a1f;
        --purr-bg-2: #1a1236;
        --purr-accent: #a886ff;
        --purr-accent-2: #7d5cff;
        --purr-ink: #f5e9ff;
        --purr-muted: #c6b6ff;
        --purr-card: #160f29;
        --purr-outline: #3a2a66;
        --radius: 14px;
      }
      * { box-sizing: border-box; }
      html, body { height: 100%; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
        color: var(--purr-ink);
        background:
          radial-gradient(1200px 600px at 20% -10%, rgba(125,92,255,.25), transparent 60%),
          radial-gradient(1200px 600px at 80% 110%, rgba(168,134,255,.18), transparent 60%),
          linear-gradient(180deg, var(--purr-bg), var(--purr-bg-2));
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .card {
        width: min(900px, 96vw);
        background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)) var(--purr-card);
        border: 1px solid var(--purr-outline);
        border-radius: var(--radius);
        box-shadow:
          0 30px 80px rgba(125,92,255,0.18),
          0 12px 24px rgba(0,0,0,0.35),
          inset 0 1px 0 rgba(255,255,255,0.06);
        padding: 28px;
        position: relative;
      }
      .ears { position: absolute; top: -18px; left: 24px; right: 24px; display: flex; justify-content: space-between; }
      .ear {
        width: 28px; height: 28px; transform: rotate(45deg);
        background: linear-gradient(135deg, var(--purr-accent), var(--purr-accent-2));
        border: 1px solid var(--purr-outline);
        box-shadow: 0 8px 20px rgba(125,92,255,0.45);
        border-radius: 4px 2px 10px 2px;
      }
      h1 { margin: 8px 0 16px 0; font-weight: 900; font-size: 28px; letter-spacing: .2px; }
      p.lead { margin: 0 0 16px 0; color: var(--purr-muted); }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px 18px; }
      @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
      .row { display: contents; }
      .label { color: var(--purr-muted); font-size: 13px; }
      .value { background: rgba(255,255,255,0.03); border: 1px solid var(--purr-outline); padding: 12px 14px; border-radius: 12px; }
      pre.value { white-space: pre-wrap; word-wrap: break-word; }
      .actions { display: flex; justify-content: space-between; gap: 12px; margin-top: 18px; }
      a.btn { text-decoration: none; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--purr-outline); background: linear-gradient(90deg, rgba(125,92,255,.18), rgba(168,134,255,.22)); color: var(--purr-ink); font-weight: 700; }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="ears"><div class="ear"></div><div class="ear"></div></div>
      <h1>Thank you for entering a review</h1>
      <p class="lead">Your submission was received. Here is what you sent:</p>
      <section class="grid">
        <div class="label">Artist</div>
        <div class="value"><?php echo h($artist); ?></div>

        <div class="label">Album Title</div>
        <div class="value"><?php echo h($album); ?></div>

        <div class="label">Song Title</div>
        <div class="value"><?php echo h($song); ?></div>

        <div class="label">Reviewer Name</div>
        <div class="value"><?php echo h($reviewer); ?></div>

        <div class="label">Streaming Platform</div>
        <div class="value"><?php echo h($platform); ?></div>

        <div class="label">Rating</div>
        <div class="value"><?php echo h($rating); ?></div>

        <div class="label">Review</div>
        <pre class="value"><?php echo h($review); ?></pre>
      </section>
      <div class="actions">
        <a class="btn" href="/">Write another review</a>
        <a class="btn" href="/">Go to homepage</a>
      </div>
    </main>
  </body>
</html>



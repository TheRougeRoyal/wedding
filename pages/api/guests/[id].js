/**
 * /pages/api/guests/[id].js
 *
 * Dynamic route for individual guest operations.
 *
 * GET    — Confirm the endpoint is active for the given guest ID.
 * DELETE — Acknowledge deletion of the guest by ID.
 *
 * Since guest data is persisted in client-side localStorage, these
 * endpoints serve as acknowledgement / validation stubs.
 */

export default async function handler(req, res) {
  // The dynamic segment is automatically parsed by Next.js Pages Router
  const { id } = req.query;

  // Guard: id must be present (should always be, but just in case)
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Missing guest ID in URL.',
    });
  }

  switch (req.method) {
    // ── GET — endpoint health / info ────────────────────────────
    case 'GET': {
      return res.status(200).json({
        success: true,
        id,
        message: 'Guest endpoint active',
      });
    }

    // ── DELETE — acknowledge guest removal ──────────────────────
    case 'DELETE': {
      return res.status(200).json({
        success: true,
        id,
      });
    }

    // ── All other methods → 405 ─────────────────────────────────
    default: {
      res.setHeader('Allow', 'GET, DELETE');
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed.`,
      });
    }
  }
}

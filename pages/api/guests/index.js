/**
 * /pages/api/guests/index.js
 *
 * GET  — Returns info message (guest data lives in client localStorage).
 * POST — Validates an incoming guest object and returns it with a
 *         server-generated unique ID.
 *
 * Guest storage is client-side (localStorage), so this endpoint acts
 * as a validation + ID-generation layer rather than a persistence layer.
 */

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Generate a collision-resistant guest ID.
 * Format: guest_{timestamp}_{random9chars}
 */
function generateGuestId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `guest_${timestamp}_${random}`;
}

/**
 * Validate the required fields on a guest object.
 * Returns an array of error messages (empty = valid).
 *
 * @param {object} guest
 * @returns {string[]}
 */
function validateGuest(guest) {
  const errors = [];

  if (!guest || typeof guest !== 'object') {
    return ['Request body must be a valid guest object.'];
  }

  if (!guest.name || typeof guest.name !== 'string' || !guest.name.trim()) {
    errors.push('name is required and must be a non-empty string.');
  }

  if (!guest.pnr || typeof guest.pnr !== 'string' || !guest.pnr.trim()) {
    errors.push('pnr is required and must be a non-empty string.');
  }

  return errors;
}

// ─── Handler ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  switch (req.method) {
    // ── GET ──────────────────────────────────────────────────────
    case 'GET': {
      return res.status(200).json({
        success: true,
        message: 'Guests are managed client-side via localStorage',
      });
    }

    // ── POST — create / validate a guest ────────────────────────
    case 'POST': {
      // Guard against empty or malformed body
      const body = req.body;

      if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Request body is empty or not valid JSON.',
        });
      }

      // Validate required fields
      const errors = validateGuest(body);

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed.',
          details: errors,
        });
      }

      // Build the validated guest with a server-generated ID
      const id = generateGuestId();

      const validatedGuest = {
        id,
        name: body.name.trim(),
        pnr: body.pnr.trim(),
        // Preserve any optional fields the client may send
        ...(body.phone && { phone: body.phone }),
        ...(body.email && { email: body.email }),
        ...(body.notes && { notes: body.notes }),
        ...(body.side && { side: body.side }),
        ...(body.relation && { relation: body.relation }),
        createdAt: new Date().toISOString(),
      };

      return res.status(201).json({
        success: true,
        guest: validatedGuest,
      });
    }

    // ── All other methods → 405 ─────────────────────────────────
    default: {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed.`,
      });
    }
  }
}

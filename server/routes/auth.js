const express = require('express');
const router = express.Router();
const { authenticate, isAdminEmail } = require('../middleware/auth');

/**
 * POST /api/auth/validate-invite
 * Valida a chave de convite antes de permitir o cadastro.
 */
/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado + flag isAdmin.
 */
router.get('/me', authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    full_name: req.user.user_metadata?.full_name || null,
    isAdmin: isAdminEmail(req.user.email),
  });
});

router.post('/validate-invite', (req, res) => {
  const { inviteKey } = req.body;
  const validKey = process.env.INVITE_KEY;

  if (!validKey) {
    return res.status(500).json({ error: 'Chave de convite não configurada no servidor.' });
  }

  if (!inviteKey || inviteKey.trim() !== validKey) {
    return res.status(403).json({ error: 'Chave de convite inválida.' });
  }

  return res.json({ valid: true });
});

module.exports = router;

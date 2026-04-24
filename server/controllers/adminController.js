const { supabase } = require('../middleware/auth');

async function listUsers(req, res) {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
    if (error) throw error;

    const users = (data.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name || null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
    }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updatePassword(req, res) {
  const { id } = req.params;
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres.' });
  }
  try {
    const { error } = await supabase.auth.admin.updateUserById(id, { password });
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Não é possível excluir sua própria conta.' });
  }
  try {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listUsers, updatePassword, deleteUser };

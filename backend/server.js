/**
 * PsychoFlow Backend — Express + Supabase
 * ----------------------------------------
 * Install:  npm install express cors @supabase/supabase-js dotenv
 * Run:      node server.js
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Supabase client ──────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY   // use SERVICE_ROLE key for full access in server contexts
);

app.use(cors());
app.use(express.json());

// ── Helpers ──────────────────────────────────────────────────
const handleError = (res, error) => {
  console.error('[PsychoFlow API]', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
};

// ════════════════════════════════════════════════════════════
//  DONORS
// ════════════════════════════════════════════════════════════

// GET /api/donors — list all donors
app.get('/api/donors', async (_req, res) => {
  const { data, error } = await supabase
    .from('donors')
    .select('*')
    .order('date', { ascending: false });
  if (error) return handleError(res, error);
  res.json(data);
});

// POST /api/donors — add a donor
app.post('/api/donors', async (req, res) => {
  const { name, amount, date, note } = req.body;
  if (!name || !amount) return res.status(400).json({ error: 'name and amount are required' });
  const { data, error } = await supabase
    .from('donors')
    .insert([{ name, amount: parseFloat(amount), date: date || new Date().toISOString().split('T')[0], note }])
    .select()
    .single();
  if (error) return handleError(res, error);
  res.status(201).json(data);
});

// DELETE /api/donors/:id — remove a donor
app.delete('/api/donors/:id', async (req, res) => {
  const { error } = await supabase.from('donors').delete().eq('id', req.params.id);
  if (error) return handleError(res, error);
  res.json({ success: true });
});

// ════════════════════════════════════════════════════════════
//  RECIPIENTS
// ════════════════════════════════════════════════════════════

// GET /api/recipients — list all recipients
app.get('/api/recipients', async (_req, res) => {
  const { data, error } = await supabase
    .from('recipients')
    .select('*')
    .order('date', { ascending: false });
  if (error) return handleError(res, error);
  res.json(data);
});

// POST /api/recipients — add a recipient
app.post('/api/recipients', async (req, res) => {
  const { name, amount_received, date, note } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const { data, error } = await supabase
    .from('recipients')
    .insert([{ name, amount_received: parseFloat(amount_received) || 0, date: date || new Date().toISOString().split('T')[0], note }])
    .select()
    .single();
  if (error) return handleError(res, error);
  res.status(201).json(data);
});

// DELETE /api/recipients/:id
app.delete('/api/recipients/:id', async (req, res) => {
  const { error } = await supabase.from('recipients').delete().eq('id', req.params.id);
  if (error) return handleError(res, error);
  res.json({ success: true });
});

// ════════════════════════════════════════════════════════════
//  ALLOCATIONS
// ════════════════════════════════════════════════════════════

// GET /api/allocations — list all allocations (joined)
app.get('/api/allocations', async (_req, res) => {
  const { data, error } = await supabase
    .from('allocations')
    .select(`
      id, amount, date,
      donor:donor_id (id, name),
      recipient:recipient_id (id, name)
    `)
    .order('date', { ascending: false });
  if (error) return handleError(res, error);
  res.json(data);
});

// POST /api/allocations — record a fund allocation
app.post('/api/allocations', async (req, res) => {
  const { donor_id, recipient_id, amount, date } = req.body;
  if (!donor_id || !recipient_id || !amount)
    return res.status(400).json({ error: 'donor_id, recipient_id, and amount are required' });
  const { data, error } = await supabase
    .from('allocations')
    .insert([{ donor_id, recipient_id, amount: parseFloat(amount), date: date || new Date().toISOString().split('T')[0] }])
    .select()
    .single();
  if (error) return handleError(res, error);
  res.status(201).json(data);
});

// DELETE /api/allocations/:id
app.delete('/api/allocations/:id', async (req, res) => {
  const { error } = await supabase.from('allocations').delete().eq('id', req.params.id);
  if (error) return handleError(res, error);
  res.json({ success: true });
});

// ════════════════════════════════════════════════════════════
//  SUMMARY (fund totals)
// ════════════════════════════════════════════════════════════
app.get('/api/summary', async (_req, res) => {
  const [{ data: donors }, { data: allocations }] = await Promise.all([
    supabase.from('donors').select('amount'),
    supabase.from('allocations').select('amount'),
  ]);
  const totalDonated     = (donors      || []).reduce((s, d) => s + parseFloat(d.amount || 0), 0);
  const totalDistributed = (allocations || []).reduce((s, a) => s + parseFloat(a.amount || 0), 0);
  res.json({ totalDonated, totalDistributed, balance: totalDonated - totalDistributed });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`PsychoFlow API running at http://localhost:${PORT}`));
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { name, email, password, role, ville, metier, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 1️⃣ Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, name }
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  const userId = authData.user.id;

  // 2️⃣ Hash password for your own table
  const password_hash = await bcrypt.hash(password, 10);

  // 3️⃣ Insert into your custom users table
  const { error } = await supabase.from('users').insert({
    id: userId,
    name,
    email,
    location: ville || null,
    phone: phone || null,
    password_hash,
    role: role.toUpperCase(),
    metier: metier || null,
    updated_at: new Date().toISOString()
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({
    success: true,
    message: 'Signup successful',
    needsEmailVerification: false
  });
}

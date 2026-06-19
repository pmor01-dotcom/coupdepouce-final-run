export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { supabase, supabaseAdmin } from '../../../../lib/supabase-server';
import bcrypt from 'bcryptjs';
import EmailService from '../../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, location, department, metier, phone } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    let supabaseUserId: string | null = null;

    if (supabaseAdmin) {
      const { data, error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role
        }
      });

      if (supabaseError) {
        console.error('Supabase signup error:', supabaseError.message);
        return NextResponse.json(
          { error: supabaseError.message || 'Could not create Supabase user' },
          { status: 500 }
        );
      }

      supabaseUserId = data.user?.id ?? null;
    } else {
      if (!supabase) {
        return NextResponse.json(
          { error: 'Supabase is not configured' },
          { status: 500 }
        );
      }

      const { data, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (supabaseError) {
        console.error('Supabase signup error:', supabaseError.message);
        return NextResponse.json(
          { error: supabaseError.message || 'Could not create Supabase user' },
          { status: 500 }
        );
      }

      supabaseUserId = data.user?.id ?? null;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        role: role.toUpperCase(),
        location: location || null,
        department: department || null,
        metier: metier || null,
        phone: phone || null,
        is_paid: role.toLowerCase() === 'client'
      },
      include: {
        subscriptions: true
      }
    });

    const welcomeSent = await EmailService.sendWelcomeEmail(user.email, user.name, user.role);
    if (!welcomeSent) {
      console.error(`Failed to send welcome email to ${user.email}`);
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'pmor01@free.fr';
    const notificationSent = await EmailService.sendNewSignupNotification(adminEmail, {
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      department: user.department,
      metier: user.metier,
      phone: user.phone,
    });

    if (!notificationSent) {
      console.error(`Failed to send signup notification to ${adminEmail}`);
    }

    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { supabase, supabaseAdmin } from '../../../../lib/supabase-server';
import bcrypt from 'bcryptjs';
import EmailService from '../../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    console.log('Signup request received');
    const { email, password, name, role, location, department, metier, phone } = await request.json();

    console.log('Signup data:', { email, name, role, location, department, metier, phone });

    if (!email || !password || !name || !role) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    console.log('Checking for existing user...');
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    console.log('Creating Prisma user...');
    // Create Prisma user first (this is the primary database)
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

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

    console.log('Prisma user created successfully:', user.id);

    // Try to create Supabase user (non-blocking)
    try {
      if (supabaseAdmin) {
        const { error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name,
            role
          }
        });

        if (supabaseError) {
          console.error('Supabase signup error (non-blocking):', supabaseError.message);
        }
      } else if (supabase) {
        const { error: supabaseError } = await supabase.auth.signUp({
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
          console.error('Supabase signup error (non-blocking):', supabaseError.message);
        }
      } else {
        console.warn('Supabase is not configured, skipping Supabase user creation');
      }
    } catch (supabaseError) {
      console.error('Supabase signup error (non-blocking):', supabaseError);
    }

    // Send welcome email (non-blocking)
    try {
      const welcomeSent = await EmailService.sendWelcomeEmail(user.email, user.name, user.role);
      if (!welcomeSent) {
        console.error(`Failed to send welcome email to ${user.email}`);
      }
    } catch (emailError) {
      console.error('Welcome email error (non-blocking):', emailError);
    }

    // Send signup notification email (non-blocking)
    try {
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
    } catch (emailError) {
      console.error('Signup notification email error (non-blocking):', emailError);
    }

    const { password_hash, ...userWithoutPassword } = user;

    console.log('Signup successful for user:', user.email);
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

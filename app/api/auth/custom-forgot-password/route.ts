// 1️⃣ Fetch all users (Supabase v2)
const { data: usersPage, error: listError } =
  await supabase.auth.admin.listUsers()

if (listError) {
  console.error('Error listing users:', listError)
  return NextResponse.json(
    { error: 'Failed to lookup user' },
    { status: 500 }
  )
}

// 2️⃣ Extract users safely (handles all Supabase v2 shapes)
const allUsers =
  Array.isArray(usersPage)
    ? usersPage
    : Array.isArray(usersPage?.users)
      ? usersPage.users
      : []

console.log("Extracted users:", allUsers)

// 3️⃣ Find user by email
const userData = allUsers.find(u => u.email === email)

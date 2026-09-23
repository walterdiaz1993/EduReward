const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});
async function test() {
  const { data, error } = await supabase.auth.signUp({ email: 'test_student123@edureward.dev', password: 'test_student123' });
  console.log(error ? error.message : "Success");
}
test();

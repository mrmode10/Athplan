
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://haicfgsgimpwnukympab.supabase.co';
const supabaseKey = 'sb_publishable_TlM38PD842aKFHGgUvmrdQ_wWrdhweW'; // Using the key found in source
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Starting Verification...");
    const email = `test.user.${Date.now()}@gmail.com`;
    const password = 'Password123!';

    // 1. Sign Up
    console.log(`1. Signing up ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
    });

    if (authError) {
        console.error("Signup failed:", authError);
        process.exit(1);
    }

    const user = authData.user;
    console.log("Session:", authData.session ? "Active" : "Null (Email Confirm Needed?)");
    if (!user) {
        console.error("No user returned (maybe email confirm needed?)");
        // If email confirm is needed, we can't test storage easily without a session.
        // But let's see if we got a session.
        if (!authData.session) {
            console.log("No session returned. Auto-confirm might be off. Checking if we can sign in...");
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email, password
            });
            if (loginError) {
                console.error("Login failed:", loginError);
                console.log("Cannot proceed without active session.");
                process.exit(1);
            }
            console.log("Logged in successfully.");
        }
    } else {
        console.log("Signup successful, user:", user.id);
    }

    // Debug Session
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Current Session User:", session?.user?.id);
    console.log("Access Token available:", !!session?.access_token);

    // Debug Buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) console.error("List Buckets Error:", bucketError);
    else console.log("Available Buckets:", buckets.map(b => b.name));

    // 2. Upload to Own Folder
    console.log("2. Testing Upload to Own Folder...");
    const fileName = 'test_doc.txt';
    const filePath = `${user.id}/${fileName}`;
    const fileBody = new Blob(['Hello World'], { type: 'text/plain' });

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, fileBody);

    if (uploadError) {
        console.error("Own Upload Failed:", uploadError);
    } else {
        console.log("Own Upload Success:", uploadData);
    }

    // 3. Upload to Other Folder (Should Fail)
    console.log("3. Testing Upload to Other Folder...");
    const otherPath = `some_other_user_id/${fileName}`;
    const { data: badUpload, error: badError } = await supabase.storage
        .from('documents')
        .upload(otherPath, fileBody);

    if (badError) {
        console.log("Blocked Upload (Expected):", badError.message);
    } else {
        console.error("SECURITY FAIL: Uploaded to other user folder!", badUpload);
    }

    // 4. List Files (Should see own)
    console.log("4. Listing Files...");
    const { data: listData, error: listError } = await supabase.storage
        .from('documents')
        .list(user.id);

    if (listError) {
        console.error("List Failed:", listError);
    } else {
        console.log("List Success. Files found:", listData.length);
        const found = listData.find(f => f.name === fileName);
        if (found) console.log("Found uploaded file!");
        else console.error("File not found in list.");
    }

    console.log("Verification Complete.");
}

run();

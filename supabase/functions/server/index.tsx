import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-d6e2fa79/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize Supabase client
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
};

// Sign up endpoint
app.post("/make-server-d6e2fa79/signup", async (c) => {
  try {
    const { email, password, name, userType } = await c.req.json();
    
    if (!email || !password || !name || !userType) {
      return c.json({ error: "Missing required fields: email, password, name, userType" }, 400);
    }

    if (!['startup', 'contractor', 'employer'].includes(userType)) {
      return c.json({ error: "Invalid userType. Must be 'startup', 'contractor', or 'employer'" }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      userType,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      user: {
        id: data.user.id,
        email,
        name,
        userType
      }
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Create project endpoint (employer only)
app.post("/make-server-d6e2fa79/projects", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user profile to verify they are an employer
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.userType !== 'employer') {
      return c.json({ error: "Only employers can create projects" }, 403);
    }

    const { title, description, budget, deadline, skills } = await c.req.json();

    if (!title || !description) {
      return c.json({ error: "Title and description are required" }, 400);
    }

    const projectId = crypto.randomUUID();
    const project = {
      id: projectId,
      title,
      description,
      budget,
      deadline,
      skills: skills || [],
      employerId: user.id,
      employerName: userProfile.name,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    await kv.set(`project:${projectId}`, project);
    
    // Add to projects list
    const projectsList = await kv.get('projects:list') || [];
    projectsList.unshift(projectId);
    await kv.set('projects:list', projectsList);

    return c.json({ project });
  } catch (error) {
    console.log(`Create project error: ${error}`);
    return c.json({ error: "Internal server error creating project" }, 500);
  }
});

// Get all projects
app.get("/make-server-d6e2fa79/projects", async (c) => {
  try {
    const projectsList = await kv.get('projects:list') || [];
    const projects = [];

    for (const projectId of projectsList) {
      const project = await kv.get(`project:${projectId}`);
      if (project) {
        projects.push(project);
      }
    }

    return c.json({ projects });
  } catch (error) {
    console.log(`Get projects error: ${error}`);
    return c.json({ error: "Internal server error fetching projects" }, 500);
  }
});

// Create post endpoint (employer only)
app.post("/make-server-d6e2fa79/posts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user profile to verify they are an employer
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.userType !== 'employer') {
      return c.json({ error: "Only employers can create posts" }, 403);
    }

    const { content } = await c.req.json();

    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    const postId = crypto.randomUUID();
    const post = {
      id: postId,
      content,
      authorId: user.id,
      authorName: userProfile.name,
      createdAt: new Date().toISOString()
    };

    await kv.set(`post:${postId}`, post);
    
    // Add to posts list
    const postsList = await kv.get('posts:list') || [];
    postsList.unshift(postId);
    await kv.set('posts:list', postsList);

    return c.json({ post });
  } catch (error) {
    console.log(`Create post error: ${error}`);
    return c.json({ error: "Internal server error creating post" }, 500);
  }
});

// Get all posts
app.get("/make-server-d6e2fa79/posts", async (c) => {
  try {
    const postsList = await kv.get('posts:list') || [];
    const posts = [];

    for (const postId of postsList) {
      const post = await kv.get(`post:${postId}`);
      if (post) {
        posts.push(post);
      }
    }

    return c.json({ posts });
  } catch (error) {
    console.log(`Get posts error: ${error}`);
    return c.json({ error: "Internal server error fetching posts" }, 500);
  }
});

// Get user profile
app.get("/make-server-d6e2fa79/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseAdmin();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    return c.json({ user: userProfile });
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: "Internal server error fetching profile" }, 500);
  }
});

Deno.serve(app.fetch);
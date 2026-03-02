@extends('layouts.guest')

@section('content')
<!-- Navbar -->
<nav class="navbar">
    <div class="nav-container">
        <a href="#" class="logo"><span class="sparkle-icon"></span> Azhagii</a>
        <ul class="nav-links">
            <li><a href="#hero">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How It Works</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
        @auth
            <div class="nav-auth-buttons">
                <span style="color:var(--text-muted);font-size:0.9rem;">Hi, {{ auth()->user()->name }}</span>
                <a href="{{ route('dashboard') }}" class="btn btn-primary" style="padding:0.5rem 1rem;font-size:0.9rem;">Dashboard</a>
            </div>
        @else
            <div class="nav-auth-buttons">
                <a href="{{ route('login') }}" class="btn btn-outline" style="padding:0.5rem 1.2rem;font-size:0.9rem;">Sign In</a>
                <a href="{{ route('register') }}" class="btn btn-primary" style="padding:0.5rem 1.2rem;font-size:0.9rem;">Get Started</a>
            </div>
        @endauth
    </div>
</nav>

<!-- Hero -->
<section id="hero" class="hero">
    <div class="hero-glow"></div>
    <div class="hero-content">
        <div class="hero-badge"><i class="fas fa-graduation-cap"></i> Multi-College LMS Platform</div>
        <h1>The Future of <br><span>Learning Experience</span></h1>
        <p>Azhagii empowers colleges with a unified learning platform. Manage courses, deliver content, and track progress across multiple institutions seamlessly.</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
            <a href="{{ route('register') }}" class="btn btn-primary"><i class="fas fa-rocket"></i> Start Learning</a>
            <a href="#features" class="btn btn-outline"><i class="fas fa-info-circle"></i> Learn More</a>
        </div>
    </div>
</section>

<!-- About -->
<section id="about">
    <div class="section-header"><h2>About Azhagii LMS</h2></div>
    <div class="about-grid">
        <div class="about-card">
            <h3><i class="fas fa-globe" style="color:var(--accent-purple);margin-right:10px;"></i> Multi-College SaaS</h3>
            <p>One platform, many institutions. Azhagii is built for the multi-college use case — each college operates independently while administrators have a global view.</p>
        </div>
        <div class="about-card" style="border-color:var(--accent-blue);">
            <h3><i class="fas fa-shield-alt" style="color:var(--accent-blue);margin-right:10px;"></i> Role-Based Access</h3>
            <p>Four distinct user roles — Super Admin, Admin Azhagii, Coordinator, and Student — each with carefully designed permissions and dashboards.</p>
        </div>
    </div>
</section>

<!-- Features -->
<section id="features">
    <div class="section-header"><h2>Platform Features</h2></div>
    <div class="features-grid">
        <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-university"></i></div>
            <h3>College Management</h3>
            <p>Super Admins manage all colleges, creating a scalable multi-tenant architecture for educational institutions.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon" style="background:rgba(197,138,249,0.1);"><i class="fas fa-book" style="color:var(--accent-purple);"></i></div>
            <h3>Course Creation</h3>
            <p>Admins create courses and assign them to specific colleges. Coordinators then enrich them with tailored content.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon" style="background:rgba(253,186,116,0.1);"><i class="fas fa-upload" style="color:var(--accent-pink);"></i></div>
            <h3>Content Delivery</h3>
            <p>Coordinators upload videos, PDFs, text lessons, and links — all organized and accessible to their college students.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon" style="background:rgba(52,211,153,0.1);"><i class="fas fa-chart-line" style="color:#34d399;"></i></div>
            <h3>Progress Tracking</h3>
            <p>Students track their learning journey with enrollment management, progress bars, and completion tracking.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon" style="background:rgba(251,191,36,0.1);"><i class="fas fa-users-cog" style="color:#fbbf24;"></i></div>
            <h3>User Management</h3>
            <p>Complete user management with role-based access control. Create and manage users across all institutions.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon" style="background:rgba(248,113,113,0.1);"><i class="fas fa-link" style="color:#f87171;"></i></div>
            <h3>Course Assignments</h3>
            <p>Assign any course to any college. Flexible mapping gives institutions access to a growing library of content.</p>
        </div>
    </div>
</section>

<!-- How It Works -->
<section id="how">
    <div class="section-header"><h2>How It Works</h2></div>
    <div class="steps-grid">
        <div class="step-card">
            <div class="step-number">1</div>
            <h3>Admin Creates Courses</h3>
            <p>Super Admins or Admin Azhagii create courses and assign them to colleges on the platform.</p>
        </div>
        <div class="step-card">
            <div class="step-number">2</div>
            <h3>Coordinators Add Content</h3>
            <p>College coordinators upload videos, PDFs, and lessons to courses assigned to their institution.</p>
        </div>
        <div class="step-card">
            <div class="step-number">3</div>
            <h3>Students Learn</h3>
            <p>Students browse available courses, enroll, consume content, and track their learning progress.</p>
        </div>
    </div>
</section>

<!-- Contact -->
<section id="contact">
    <div class="contact-container">
        <h2 style="text-align:center;margin-bottom:2rem;">Get in Touch</h2>
        <form onsubmit="event.preventDefault();">
            <div class="form-group">
                <input type="text" class="form-input" placeholder="Your Name" required>
            </div>
            <div class="form-group">
                <input type="email" class="form-input" placeholder="Your Email" required>
            </div>
            <div class="form-group">
                <textarea class="form-input" placeholder="How can we help?" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">Send Message</button>
        </form>
    </div>
</section>

<!-- Footer -->
<footer class="site-footer">
    <div class="footer-content">
        <h3 class="logo" style="justify-content:center;margin-bottom:1rem;">
            <span class="sparkle-icon"></span> Azhagii
        </h3>
        <p>&copy; {{ date('Y') }} Azhagii LMS. All rights reserved.</p>
        <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
        </div>
    </div>
</footer>
@endsection

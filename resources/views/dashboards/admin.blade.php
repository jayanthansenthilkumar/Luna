@extends('layouts.app')

@section('content')
<!-- Welcome Banner -->
<div class="dashboard-welcome">
    <div class="welcome-text">
        <h2>Welcome back, {{ auth()->user()->name }}</h2>
        <p>Manage users, create courses and assign them to colleges across the platform.</p>
    </div>
    <div class="welcome-icon"><i class="fas fa-user-tie"></i></div>
</div>

<!-- Stats Grid -->
<div class="stats-grid" id="admin-stats-container">
    <div class="stat-card">
        <div class="stat-icon" style="background:#4285f415;color:#4285f4;"><i class="fas fa-users"></i></div>
        <div><div class="stat-value">{{ $stats['users'] }}</div><div class="stat-label">Users</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#9b72cb15;color:#9b72cb;"><i class="fas fa-book"></i></div>
        <div><div class="stat-value">{{ $stats['courses'] }}</div><div class="stat-label">Courses</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#f8717115;color:#f87171;"><i class="fas fa-clock"></i></div>
        <div><div class="stat-value">{{ $stats['pending_courses'] }}</div><div class="stat-label">Pending Approvals</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#fbbf2415;color:#fbbf24;"><i class="fas fa-clipboard-list"></i></div>
        <div><div class="stat-value">{{ $stats['enrollments'] }}</div><div class="stat-label">Enrollments</div></div>
    </div>
</div>

<!-- Quick Actions -->
<div class="dashboard-section-title"><i class="fas fa-bolt"></i> Quick Actions</div>
<div class="quick-actions-grid">
    <a href="{{ route('users') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(66,133,244,0.1);color:#4285f4;"><i class="fas fa-users"></i></div>
        <div><h4>Manage Users</h4><p>Create coordinators & students</p></div>
    </a>
    <a href="{{ route('courses') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(155,114,203,0.1);color:#9b72cb;"><i class="fas fa-book"></i></div>
        <div><h4>Manage Courses</h4><p>Create and publish courses</p></div>
    </a>
    <a href="{{ route('course-approvals') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(251,191,36,0.1);color:#fbbf24;"><i class="fas fa-check-double"></i></div>
        <div><h4>Course Approvals</h4><p>Review and approve submitted courses</p></div>
    </a>
    <a href="{{ route('course-assignments') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(52,211,153,0.1);color:#34d399;"><i class="fas fa-link"></i></div>
        <div><h4>Course Assignments</h4><p>Assign courses to colleges</p></div>
    </a>
</div>

<!-- Platform Overview -->
<div class="dashboard-section-title"><i class="fas fa-chart-bar"></i> Platform Overview</div>
<div class="admin-overview-grid">
    <div class="card">
        <h3 style="margin-bottom:1rem;font-size:1rem;"><i class="fas fa-users" style="color:var(--accent-blue);margin-right:0.5rem;"></i>User Breakdown</h3>
        <div class="breakdown-list">
            <div class="breakdown-item"><span class="breakdown-dot" style="background:#9b72cb;"></span><span>Coordinators</span><strong>{{ $userBreakdown['azhagiiCoordinator'] }}</strong></div>
            <div class="breakdown-item"><span class="breakdown-dot" style="background:#4285f4;"></span><span>Students</span><strong>{{ $userBreakdown['azhagiiStudents'] }}</strong></div>
        </div>
    </div>
    <div class="card">
        <h3 style="margin-bottom:1rem;font-size:1rem;"><i class="fas fa-book" style="color:var(--accent-purple);margin-right:0.5rem;"></i>Recent Courses</h3>
        <div class="breakdown-list">
            @forelse($recentCourses as $c)
                @php $statusClass = $c->status === 'active' ? 'active' : ($c->status === 'draft' ? 'draft' : 'inactive'); @endphp
                <div class="breakdown-item">
                    <span class="badge badge-{{ $statusClass }}">{{ $c->status }}</span>
                    <span>{{ $c->title }}</span>
                    <small style="color:var(--text-muted);">{{ $c->enrollments_count }} enrolled</small>
                </div>
            @empty
                <div class="empty-state" style="padding:1rem;"><p>No courses yet</p></div>
            @endforelse
        </div>
    </div>
</div>
@endsection

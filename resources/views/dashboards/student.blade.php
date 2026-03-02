@extends('layouts.app')

@section('content')
<!-- Welcome Banner -->
<div class="dashboard-welcome">
    <div class="welcome-text">
        <h2>Welcome back, {{ auth()->user()->name }}</h2>
        <p>Continue your learning journey at <strong>{{ auth()->user()->college->name ?? 'your college' }}</strong>. Pick up where you left off.</p>
    </div>
    <div class="welcome-icon"><i class="fas fa-graduation-cap"></i></div>
</div>

<!-- Progress Overview -->
<div class="progress-overview-grid" id="student-progress-overview">
    <div class="progress-card">
        <div class="progress-card-header">
            <div class="progress-card-icon" style="background:rgba(155,114,203,0.1);color:#9b72cb;"><i class="fas fa-user-circle"></i></div>
            <div><h4>Profile Completion</h4><p class="progress-card-subtitle">Complete your profile for a better experience</p></div>
        </div>
        <div class="progress-card-bar">
            <div class="progress-card-bar-track">
                <div class="progress-card-bar-fill" style="width:{{ $profilePct }}%; background:{{ $profilePct >= 100 ? 'linear-gradient(90deg, #22c55e, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)' }};"></div>
            </div>
            <span class="progress-card-pct">{{ $profilePct }}%</span>
        </div>
        <p class="progress-card-detail">
            @if($profilePct >= 100)
                <span style="color:#22c55e;"><i class="fas fa-check-circle"></i> Profile complete!</span>
            @else
                Complete your profile — <a href="{{ route('profile') }}">Complete now</a>
            @endif
        </p>
    </div>
    <div class="progress-card">
        <div class="progress-card-header">
            <div class="progress-card-icon" style="background:rgba(66,133,244,0.1);color:#4285f4;"><i class="fas fa-book-reader"></i></div>
            <div><h4>Course Progress</h4><p class="progress-card-subtitle">Your overall learning progress</p></div>
        </div>
        <div class="progress-card-bar">
            <div class="progress-card-bar-track">
                <div class="progress-card-bar-fill" style="width:{{ $stats['avg_progress'] }}%; background:{{ $stats['avg_progress'] >= 100 ? 'linear-gradient(90deg, #22c55e, #34d399)' : '' }};"></div>
            </div>
            <span class="progress-card-pct">{{ $stats['avg_progress'] }}%</span>
        </div>
        <div class="course-progress-list">
            @forelse($courseProgress->take(5) as $cp)
                @php
                    $p = intval($cp->progress);
                    $color = ($cp->status === 'completed') ? '#22c55e' : (($p >= 50) ? '#4285f4' : '#f59e0b');
                @endphp
                <div class="cp-item">
                    <div class="cp-item-info">
                        <span class="cp-item-title">{{ $cp->course->title ?? 'Unknown' }}</span>
                        <span class="cp-item-pct" style="color:{{ $color }};">{{ $p }}%</span>
                    </div>
                    <div class="cp-item-bar"><div class="cp-item-bar-fill" style="width:{{ $p }}%;background:{{ $color }};"></div></div>
                </div>
            @empty
                <p style="font-size:0.82rem;color:var(--text-muted);margin-top:0.5rem;">No enrolled courses yet. <a href="{{ route('browse-courses') }}">Browse courses</a></p>
            @endforelse
        </div>
    </div>
</div>

<!-- Stats Grid -->
<div class="stats-grid" id="student-stats-grid">
    <div class="stat-card">
        <div class="stat-icon" style="background:#4285f415;color:#4285f4;"><i class="fas fa-book-reader"></i></div>
        <div><div class="stat-value">{{ $stats['enrolled'] }}</div><div class="stat-label">Enrolled Courses</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#34d39915;color:#34d399;"><i class="fas fa-check-circle"></i></div>
        <div><div class="stat-value">{{ $stats['completed'] }}</div><div class="stat-label">Completed</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#9b72cb15;color:#9b72cb;"><i class="fas fa-compass"></i></div>
        <div><div class="stat-value">{{ $stats['available'] }}</div><div class="stat-label">Available Courses</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#fbbf2415;color:#fbbf24;"><i class="fas fa-chart-line"></i></div>
        <div><div class="stat-value">{{ $stats['avg_progress'] }}%</div><div class="stat-label">Avg Progress</div></div>
    </div>
</div>

<!-- Quick Actions -->
<div class="dashboard-section-title"><i class="fas fa-bolt"></i> Quick Actions</div>
<div class="quick-actions-grid">
    <a href="{{ route('browse-courses') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(66,133,244,0.1);color:#4285f4;"><i class="fas fa-compass"></i></div>
        <div><h4>Browse Courses</h4><p>Discover and enroll in new courses</p></div>
    </a>
    <a href="{{ route('my-learning') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(52,211,153,0.1);color:#34d399;"><i class="fas fa-graduation-cap"></i></div>
        <div><h4>My Learning</h4><p>Continue your enrolled courses</p></div>
    </a>
    <a href="{{ route('profile') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(155,114,203,0.1);color:#9b72cb;"><i class="fas fa-user-circle"></i></div>
        <div><h4>My Profile</h4><p>Update your account details</p></div>
    </a>
</div>

<!-- Continue Learning -->
@if(count($continueLearning) > 0)
<div class="dashboard-section-title"><i class="fas fa-play-circle"></i> Continue Learning</div>
<div class="course-cards-grid">
    @foreach($continueLearning as $cl)
        @php $prog = intval($cl->progress); @endphp
        <div class="course-card" onclick="window.location.href='{{ route('course-viewer') }}?courseId={{ $cl->courseId }}&enrollmentId={{ $cl->id }}';" style="cursor:pointer;">
            <div class="course-card-thumb">
                @if($cl->course->thumbnailUrl)
                    <img src="{{ asset($cl->course->thumbnailUrl) }}" alt="">
                @else
                    <div class="course-card-thumb-icon"><i class="fas fa-book"></i></div>
                @endif
            </div>
            <div class="course-card-body">
                <h4>{{ $cl->course->title ?? 'Unknown' }}</h4>
                <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:{{ $prog }}%;"></div></div>
                <span style="font-size:0.8rem;color:var(--text-muted);">{{ $prog }}% complete</span>
            </div>
        </div>
    @endforeach
</div>
@endif
@endsection

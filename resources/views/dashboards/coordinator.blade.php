@extends('layouts.app')

@section('content')
<!-- Welcome Banner -->
<div class="dashboard-welcome">
    <div class="welcome-text">
        <h2>Welcome back, {{ auth()->user()->name }}</h2>
        <p>Manage course content and track student progress for <strong>{{ auth()->user()->college->name ?? 'your college' }}</strong>.</p>
    </div>
    <div class="welcome-icon"><i class="fas fa-chalkboard-teacher"></i></div>
</div>

<!-- Stats Grid -->
<div class="stats-grid" id="coord-stats-container">
    <div class="stat-card">
        <div class="stat-icon" style="background:#4285f415;color:#4285f4;"><i class="fas fa-book-open"></i></div>
        <div><div class="stat-value">{{ $stats['courses'] }}</div><div class="stat-label">Assigned Courses</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#9b72cb15;color:#9b72cb;"><i class="fas fa-plus-circle"></i></div>
        <div><div class="stat-value">{{ $stats['my_courses'] }}</div><div class="stat-label">My Courses</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#fbbf2415;color:#fbbf24;"><i class="fas fa-clock"></i></div>
        <div><div class="stat-value">{{ $stats['my_pending'] }}</div><div class="stat-label">Pending</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#34d39915;color:#34d399;"><i class="fas fa-check-circle"></i></div>
        <div><div class="stat-value">{{ $stats['my_approved'] }}</div><div class="stat-label">Approved</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#f8717115;color:#f87171;"><i class="fas fa-times-circle"></i></div>
        <div><div class="stat-value">{{ $stats['my_rejected'] }}</div><div class="stat-label">Rejected</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#a78bfa15;color:#a78bfa;"><i class="fas fa-user-graduate"></i></div>
        <div><div class="stat-value">{{ $stats['students'] }}</div><div class="stat-label">My Students</div></div>
    </div>
</div>

<!-- Quick Actions -->
<div class="dashboard-section-title"><i class="fas fa-bolt"></i> Quick Actions</div>
<div class="quick-actions-grid">
    <a href="{{ route('create-course') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(251,191,36,0.1);color:#fbbf24;"><i class="fas fa-plus-circle"></i></div>
        <div><h4>Create Course</h4><p>Submit a new course for approval</p></div>
    </a>
    <a href="{{ route('my-courses') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(66,133,244,0.1);color:#4285f4;"><i class="fas fa-book-open"></i></div>
        <div><h4>My Courses</h4><p>View courses assigned to your college</p></div>
    </a>
    <a href="{{ route('content') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(52,211,153,0.1);color:#34d399;"><i class="fas fa-file-alt"></i></div>
        <div><h4>Manage Content</h4><p>Upload videos, PDFs and lessons</p></div>
    </a>
    <a href="{{ route('topics') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(168,135,250,0.1);color:#a78bfa;"><i class="fas fa-tags"></i></div>
        <div><h4>Manage Topics</h4><p>Add important topics per subject</p></div>
    </a>
    <a href="{{ route('my-students') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(155,114,203,0.1);color:#9b72cb;"><i class="fas fa-user-graduate"></i></div>
        <div><h4>My Students</h4><p>Track student enrollment & progress</p></div>
    </a>
</div>

<!-- Recent Student Activity -->
<div class="dashboard-section-title"><i class="fas fa-user-graduate"></i> Recent Student Activity</div>
<div class="table-responsive">
    <table class="table" id="coordRecentStudentsTable">
        <thead><tr><th>Student</th><th>Course</th><th>Progress</th><th>Status</th><th>Enrolled</th></tr></thead>
        <tbody>
            @forelse($recentActivity as $e)
                @php
                    $statBadge = $e->status === 'completed' ? 'active' : ($e->status === 'active' ? 'draft' : 'inactive');
                    $prog = intval($e->progress);
                @endphp
                <tr>
                    <td data-label="Student">{{ $e->student->name ?? 'Unknown' }}</td>
                    <td data-label="Course">{{ $e->course->title ?? 'Unknown' }}</td>
                    <td data-label="Progress">
                        <div class="progress-bar-wrap" style="min-width:80px;"><div class="progress-bar-fill" style="width:{{ $prog }}%;"></div></div>
                        <span style="font-size:0.8rem;">{{ $prog }}%</span>
                    </td>
                    <td data-label="Status"><span class="badge badge-{{ $statBadge }}">{{ $e->status }}</span></td>
                    <td data-label="Enrolled">{{ \Carbon\Carbon::parse($e->enrolledAt)->format('M d, Y') }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="empty-state"><i class="fas fa-user-graduate"></i><p>No enrollments yet</p></td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    $('#coordRecentStudentsTable').DataTable({ paging:false, searching:false, info:false, ordering:false });
});
</script>
@endpush

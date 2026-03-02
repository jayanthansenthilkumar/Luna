@extends('layouts.app')

@section('content')
<!-- Welcome Banner -->
<div class="dashboard-welcome">
    <div class="welcome-text">
        <h2>Welcome back, {{ auth()->user()->name }}</h2>
        <p>Here's your platform overview — manage colleges, users, courses, and enrollments from one place.</p>
    </div>
    <div class="welcome-icon"><i class="fas fa-shield-alt"></i></div>
</div>

<!-- Stats Grid -->
<div class="stats-grid" id="super-stats-container">
    <div class="stat-card">
        <div class="stat-icon" style="background:#4285f415;color:#4285f4;"><i class="fas fa-university"></i></div>
        <div><div class="stat-value">{{ $stats['colleges'] }}</div><div class="stat-label">Colleges</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#9b72cb15;color:#9b72cb;"><i class="fas fa-users"></i></div>
        <div><div class="stat-value">{{ $stats['users'] }}</div><div class="stat-label">Total Users</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#34d39915;color:#34d399;"><i class="fas fa-book"></i></div>
        <div><div class="stat-value">{{ $stats['courses'] }}</div><div class="stat-label">Total Courses</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#fbbf2415;color:#fbbf24;"><i class="fas fa-clipboard-check"></i></div>
        <div><div class="stat-value">{{ $stats['enrollments'] }}</div><div class="stat-label">Enrollments</div></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background:#f8717115;color:#f87171;"><i class="fas fa-clock"></i></div>
        <div><div class="stat-value">{{ $stats['pending_courses'] }}</div><div class="stat-label">Pending Approval</div></div>
    </div>
</div>

<!-- Quick Actions -->
<div class="dashboard-section-title"><i class="fas fa-bolt"></i> Quick Actions</div>
<div class="quick-actions-grid">
    <a href="{{ route('colleges') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(66,133,244,0.1);color:#4285f4;"><i class="fas fa-university"></i></div>
        <div><h4>Manage Colleges</h4><p>Add, edit or deactivate institutions</p></div>
    </a>
    <a href="{{ route('users') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(155,114,203,0.1);color:#9b72cb;"><i class="fas fa-users-cog"></i></div>
        <div><h4>Manage Users</h4><p>Create admins, coordinators & students</p></div>
    </a>
    <a href="{{ route('courses') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(52,211,153,0.1);color:#34d399;"><i class="fas fa-book"></i></div>
        <div><h4>Manage Courses</h4><p>Create and publish courses</p></div>
    </a>
    <a href="{{ route('course-assignments') }}" class="quick-action-card">
        <div class="quick-action-icon" style="background:rgba(251,191,36,0.1);color:#fbbf24;"><i class="fas fa-link"></i></div>
        <div><h4>Course Assignments</h4><p>Assign courses to colleges</p></div>
    </a>
</div>

<!-- Download Uploads -->
<div class="dashboard-section-title"><i class="fas fa-download"></i> Download Uploads</div>
<div class="quick-actions-grid">
    @foreach(['profiles', 'content', 'thumbnails'] as $folder)
        @php
            $icon = $folder === 'profiles' ? 'fa-user-circle' : ($folder === 'content' ? 'fa-file-alt' : 'fa-image');
            $color = $folder === 'profiles' ? '#4285f4' : ($folder === 'content' ? '#9b72cb' : '#34d399');
            $fs = $folderStats[$folder];
        @endphp
        <div class="quick-action-card" style="cursor:default;position:relative;">
            <div class="quick-action-icon" style="background:{{ $color }}15;color:{{ $color }};"><i class="fas {{ $icon }}"></i></div>
            <div style="flex:1;">
                <h4 style="text-transform:capitalize;">{{ $folder }}</h4>
                <p>{{ $fs['count'] }} file{{ $fs['count'] !== 1 ? 's' : '' }} &middot; {{ $fs['sizeFormatted'] }}</p>
            </div>
            @if($fs['count'] > 0)
                <button class="btn btn-sm btn-download-folder" data-folder="{{ $folder }}" style="background:{{ $color }};color:#fff;border:none;padding:0.4rem 0.9rem;border-radius:8px;font-size:0.82rem;cursor:pointer;display:inline-flex;align-items:center;gap:0.35rem;">
                    <i class="fas fa-download"></i> ZIP
                </button>
            @else
                <span style="color:var(--text-muted);font-size:0.8rem;">Empty</span>
            @endif
        </div>
    @endforeach
</div>

<!-- Recent Users -->
<div class="dashboard-section-title"><i class="fas fa-clock"></i> Recent Users</div>
<div class="table-responsive">
    <table class="table" id="recentUsersTable">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>College</th><th>Joined</th></tr></thead>
        <tbody>
            @forelse($recentUsers as $u)
                <tr>
                    <td data-label="Name">{{ $u->name }}</td>
                    <td data-label="Email">{{ $u->email }}</td>
                    <td data-label="Role"><span class="badge badge-draft">{{ $u->role }}</span></td>
                    <td data-label="College">{{ $u->college->name ?? 'N/A' }}</td>
                    <td data-label="Joined">{{ \Carbon\Carbon::parse($u->createdAt)->format('M d, Y') }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="empty-state">No users registered yet.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    $('#recentUsersTable').DataTable({ paging:false, searching:false, info:false, ordering:false });

    $('.btn-download-folder').on('click', function() {
        var btn = $(this), folder = btn.data('folder'), originalHtml = btn.html(), token = new Date().getTime();
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Preparing...');
        Swal.fire({ title:'Processing...', html:'Compressing <strong>'+folder+'</strong> files for download.<br>This may take a moment.', allowOutsideClick:false, allowEscapeKey:false, showConfirmButton:false, didOpen:function(){ Swal.showLoading(); window.location.href='{{ route("download") }}?folder='+encodeURIComponent(folder)+'&token='+token; } });
        var downloadTimer = setInterval(function() {
            var matches = document.cookie.match(new RegExp('(^| )download_started=([^;]+)')); var cookieValue = matches ? matches[2] : null;
            if (cookieValue == token) { clearInterval(downloadTimer); Swal.close(); btn.prop('disabled', false).html(originalHtml); Swal.fire({icon:'success',title:'Download Started',text:'Your '+folder+' ZIP file is being downloaded.',timer:3000,showConfirmButton:false}); document.cookie = 'download_started=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'; }
        }, 1000);
        setTimeout(function() { clearInterval(downloadTimer); if(btn.prop('disabled')){btn.prop('disabled',false).html(originalHtml);Swal.close();Swal.fire('Download Failed','The download did not start.','error');} }, 30000);
    });
});
</script>
@endpush
